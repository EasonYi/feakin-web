import MonacoEditor from "react-monaco-editor";
import React, { useCallback, useEffect, useState } from "react";
import { WebSocketSubject } from "rxjs/webSocket";
import { editor, Selection } from "monaco-editor";
import { Buffer } from "buffer";

import { addDotLangSupport } from "./editor/dot-lang";
import { CodeProp } from "../type";
import { initBasicWasm } from "./editor/subscribe-wrapper";
import { Doc } from "@feakin/diamond-types-web";

export interface FkUpstream {
  version: string;
  patch: Uint8Array;
}

export interface FkPatch {
  before: Uint32Array;
  after: Uint32Array;
  patch: Uint8Array;
}

export interface FkResponse {
  type: string;
  value: any | FkUpstream | FkPatch;
}

export type DTOp = { kind: 'Ins' | 'Del', start: number, end: number, fwd?: boolean, content?: string }

interface FkMonacoEditorParams {
  code: CodeProp;
  subject: WebSocketSubject<any>;
  updateCode: (code: CodeProp) => void;
  room: string;
  agentName: string;
  setRoomId: (roomId: string) => void;
}

function FkMonacoEditor(props: FkMonacoEditorParams) {
  const [roomId, setRoomId] = React.useState<string>(props.room);
  const [subject] = React.useState<WebSocketSubject<any>>(props.subject);
  const [editor, setEditor] = React.useState<editor.IStandaloneCodeEditor>();

  const [doc, setDoc] = React.useState<Doc>(null as any);

  const [isLoadingWasm, setIsLoadingWasm] = useState(false);

  const [content, setContent] = React.useState<string>(props.code.content);

  useEffect(() => {
    setRoomId(props.room);
    if(subject) {
      // logout
      subject.next({ "type": "LeaveRoom", "value": { "room_id": props.room, "agent_name": props.agentName } });
    }
  }, [props.room]);

  useEffect(() => {
    if (!isLoadingWasm) {
      initBasicWasm().then((wasm) => {
        setIsLoadingWasm(true);
      });
    }
  });

  const [patchInfo, setPatchInfo] = React.useState<FkPatch>(null as any);

  useEffect(() => {
    if (!isLoadingWasm) {
      return;
    }

    subject.subscribe({
      next: (msg: FkResponse) => {
        if (roomId.length === 0 && msg.type === "CreateRoom") {
          props.setRoomId(msg.value.room_id);
          setRoomId(msg.value.room_id);

          let newDoc = Doc.fromBytes(msg.value.content as any, props.agentName);
          newDoc.localToRemoteVersion(newDoc.getLocalVersion());
          setDoc(newDoc);

          return;
        }

        if (msg.type === "Join") {
          let newDoc = Doc.fromBytes(msg.value.content as any, props.agentName)
          newDoc.localToRemoteVersion(newDoc.getLocalVersion());
          setDoc(newDoc);
          setContent(newDoc.get());
          return;
        }

        if (msg.type === "Upstream") {
          console.log(`before: ${msg.value.before}, after: ${msg.value.after}`);
          setPatchInfo(msg.value);
          return;
        }
      },
      error: (err: any) => console.log(err),
      complete: () => console.log('complete')
    });

    // Todo: change content to be a json object? But since is same library? will be generate same version?
    if (roomId.length <= 0) {
      subject.next({ "type": "CreateRoom", "value": { "agent_name": props.agentName, "content": props.code.content } });
    }
  }, [props.agentName, isLoadingWasm, props, roomId.length, subject, setPatchInfo]);

  useEffect(() => {
    // Todo: apply patchInfo refactor;
    if (patchInfo) {
      try {
        console.log(doc.getLocalVersion());
        let newDoc = doc;
        let bytes = Buffer.from(patchInfo.patch);

        let merge_version = newDoc.mergeBytes(bytes)
        let last_version = newDoc.mergeVersions(newDoc.getLocalVersion(), merge_version);
        newDoc.localToRemoteVersion(last_version);

        console.log(newDoc.getLocalVersion());
        let xfSinces: DTOp[] = newDoc.xfSince(patchInfo.before);
        setDoc(newDoc);
        xfSinces.forEach((op) => {
          switch (op.kind) {
            case "Ins": {
              let monacoModel = editor!.getModel();
              const pos = monacoModel!.getPositionAt(op.start);
              const range = new Selection(pos.lineNumber, pos.column, pos.lineNumber, pos.column)
              monacoModel?.applyEdits([{ range, text: op.content! }])
              break;
            }
            case "Del": {
              let monacoModel = editor!.getModel();
              const start = monacoModel!.getPositionAt(op.start);
              const end = monacoModel!.getPositionAt(op.end);
              const range = new Selection(start.lineNumber, start.column, end.lineNumber, end.column)
              monacoModel?.applyEdits([{ range, text: "" }])
              break;
            }
            default: {
              console.log("unknown op: ", op);
            }
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
  }, [editor, patchInfo, doc]);

  const handleTextChange = useCallback((newValue: string, event: editor.IModelContentChangedEvent) => {
    event.changes.sort((change1, change2) => change2.rangeOffset - change1.rangeOffset).forEach(change => {
      // todo: wrapper to API
      if (change.text !== "") {
        subject.next({
          type: "Insert",
          value: { content: change.text, pos: change.rangeOffset, room_id: roomId }
        });
      }

      if (change.rangeLength > 0) {
        subject.next({
          type: "Delete",
          value: {
            range: { start: change.rangeOffset, end: change.rangeOffset + change.rangeLength },
            room_id: roomId
          }
        })
      }
    })

    props.updateCode({
      ...props.code,
      content: newValue
    });

    setContent(newValue);
  }, [props, subject, roomId]);

  const editorDidMount = useCallback((editor: any, monaco: any) => {
    addDotLangSupport(monaco);
    editor.layout();
    editor.focus();

    setEditor(editor);
  }, []);

  return <MonacoEditor
    width="100%"
    height="100vh"
    language={ props.code.language }
    theme="vs-dark"
    value={ content }
    onChange={ handleTextChange }
    editorDidMount={ editorDidMount }
    options={ {
      wrappingIndent: "indent",
      wordWrap: "on",
    } }
  />;
}

export default FkMonacoEditor;


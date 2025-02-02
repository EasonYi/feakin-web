import { DotImporter } from "./dot-importer";
import { Graph } from "../../model/graph";

describe('DotImporter', () => {

  it('edge with', () => {
    const importer = new DotImporter(`strict graph {
  a -- b
  a -- b
  b -- a [color=blue]
}`);
    const graph: Graph = importer.transpile();

    expect(graph.nodes.length).toBe(2);
    expect(graph.nodes[0].label).toBe("a");
    expect(graph.nodes[1].label).toBe("b");
    expect(graph.edges.length).toBe(3);
    expect(graph.edges[0]).toEqual({
      data: {
        source: "a",
        target: "b"
      },
      id: "a_b",
      points: [],
      props: {
        decorator: {
          arrowSize: 6,
          endArrowhead: "notched",
          lineDashStyle: "solid",
          lineType: "straight",
          startArrowhead: "none"
        }
      }
    });
    expect(graph.edges[1]).toEqual({
      data: {
        source: "a",
        target: "b"
      },
      id: "a_b_1",
      points: [],
      props: {
        decorator: {
          arrowSize: 6,
          endArrowhead: "notched",
          lineDashStyle: "solid",
          lineType: "straight",
          startArrowhead: "none"
        }
      }
    });
    expect(graph.edges[2]).toEqual({
      data: {
        color: "blue",
        source: "b",
        target: "a"
      },
      id: "b_a",
      points: [],
      props: {
        color: "blue",
        decorator: {
          arrowSize: 6,
          endArrowhead: "notched",
          lineDashStyle: "solid",
          lineType: "straight",
          startArrowhead: "none"
        }
      }
    });
  });

  it('label name', () => {
    const importer = new DotImporter(`digraph {
0 -> 1 [ len=2, label="(1, 0)"];
0 -> 1 [ len=0.5, dir=none, weight=10];
1 -> 0 [ len=2, label="(0, -1)"];
}`);
    const graph: Graph = importer.transpile();

    expect(graph.nodes.length).toBe(2);
    expect(graph.edges.length).toBe(3);
    expect(graph.edges[0]).toEqual({
      data: {
        label: "(1, 0)",
        len: 2,
        source: "0",
        target: "1"
      },
      id: "0_1",
      points: [],
      props: {
        decorator: {
          arrowSize: 6,
          endArrowhead: "notched",
          lineDashStyle: "solid",
          lineType: "straight",
          startArrowhead: "none"
        }
      }
    });
  });

  it('single node', () => {
    const importer = new DotImporter(`strict graph {
  sf [label="Sunflowers"]
}`);
    const graph: Graph = importer.transpile();

    expect(graph.nodes.length).toBe(1);
    expect(graph.nodes[0].label).toBe("Sunflowers");
    expect(graph.edges.length).toBe(0);
  });

  it('new id', () => {
    const importer = new DotImporter(`strict graph {
  0 -> 1 [ len=2, label="(1, 0)"];
  0 -> 1 [ len=0.5, dir=none, weight=10];
  1 -> 0 [ len=2, label="(0, -1)"];
}`);
    const graph: Graph = importer.parse();

    expect(graph.nodes.length).toBe(2);
    expect(graph.nodes[0].label).toBe("0");

    expect(graph.nodes[0].x).toBe(0);
    expect(graph.nodes[0].y).toBe(0);

    expect(graph.nodes[0].height).toBe(40);
    expect(graph.nodes[0].width).toBe(100);
  });

  it('import triangle shape', () => {
    const importer = new DotImporter(`digraph {
  "A" [shape="triangle"]
  "B"
  "C"
  "A" -> "B";
}`);
    const graph: Graph = importer.parse();

    expect(graph.nodes.length).toBe(3);
    expect(graph.nodes[0].data!.parentId).not.toBeTruthy();
    expect(graph.nodes[0].data!.shape).toBe("triangle");
  });

  it('subgraph', () => {
    const importer = new DotImporter(`digraph G {
  compound=true;
  subgraph cluster0 {
    a -> b;
    c -> d;
  }
  subgraph cluster1 {
    e -> g;
    e -> f;
  }
}`);
    const graph: Graph = importer.parse();

    expect(graph.nodes.length).toBe(9);
    expect(graph.nodes[2].data!.parentId).toBe("cluster0");
  });

  it('triangle', () => {
    const importer = new DotImporter(`digraph G {
  a [shape="triangle"]
}`);
    const graph: Graph = importer.parse();

    expect(graph.nodes.length).toBe(1);
  });

  it('subgraph label', () => {
    const importer = new DotImporter(`digraph G {
    subgraph cluster_frontend {
        label="Frontend";
        React;
        Bootstrap;
    }
}`);
    const graph: Graph = importer.parse();

    expect(graph.nodes.length).toBe(3);
    expect(graph.nodes[0].label).toBe("Frontend");
  });

  it('nested subgraph ', () => {
    const importer = new DotImporter(`digraph G {
  subgraph cluster_website {
      label="*Website*";

      subgraph cluster_frontend {
          label="*Frontend*";
          Bootstrap;
      }

      subgraph cluster_backend {
          label="*Backend*";
          expressjs;
      }
  }
}`);
    const graph: Graph = importer.parse();
    console.log(graph);

    expect(graph.nodes.length).toBe(5);
    const first = graph.nodes[0];
    expect(first.label).toBe("*Website*");
    expect(first.width! > 0).toBeTruthy();
    expect(first.height! > 0).toBeTruthy();
  });

  it('color prop ', function () {
    const importer = new DotImporter(`digraph G {
  a [shape="triangle", fillcolor=red, style=filled];
}`);

    const graph: Graph = importer.parse();

    expect(graph.nodes.length).toBe(1);
    expect(graph.nodes[0].props?.fill?.color).toBe("red");
  });

  xit('one to many', () => {
    const importer = new DotImporter(`digraph TicketBooking {
  component=true;layout=fdp;
  node [shape=box style=filled];
  cluster_reservation -> cluster_cinema;
  cluster_reservation -> cluster_movie;
  cluster_reservation -> cluster_user;

  subgraph cluster_cinema {
    label="Cinema(Context)";

    subgraph cluster_aggregate_cinema {
      label="Cinema(Aggregate)";
      entity_Cinema [label="Cinema"];
      entity_ScreeningRoom [label="ScreeningRoom"];
      entity_Seat [label="Seat"];
    }
  }

  subgraph cluster_movie {
    label="Movie(Context)";

    subgraph cluster_aggregate_movie {
      label="Movie(Aggregate)";
      entity_Movie [label="Movie"];
      entity_Actor [label="Actor"];
      entity_Publisher [label="Publisher"];
    }
  }

  subgraph cluster_reservation {
    label="Reservation(Context)";

    subgraph cluster_aggregate_reservation {
      label="Reservation(Aggregate)";
      entity_Ticket [label="Ticket"];
      entity_Reservation [label="Reservation"];
    }
  }

  subgraph cluster_user {
    label="User(Context)";

    subgraph cluster_aggregate_user {
      label="User(Aggregate)";
      entity_User [label="User"];
    }
  }
}`);

    const graph: Graph = importer.parse();
    console.log(graph);
  });
});

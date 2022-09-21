use fkl_dot::graph::Graph;
use fkl_dot::node::Node;
use fkl_parser::mir::{ConnectionDirection, ContextMap};

pub(crate) fn to_dot(context_map: &ContextMap) -> String {
  let mut graph = Graph::new("fkl");
  graph.use_default_style();

  context_map
    .contexts
    .iter()
    .for_each(|context| {
      graph.add_node(Node::new(&context.name))
    });

  context_map
    .relations
    .iter()
    .for_each(|relation| {
      match &relation.connection_type {
        ConnectionDirection::Undirected => {}
        ConnectionDirection::PositiveDirected => {
          graph.add_edge(&relation.target, &relation.source);
        }
        ConnectionDirection::NegativeDirected => {
          graph.add_edge(&relation.source, &relation.target);
        }
        ConnectionDirection::BiDirected => {
          graph.add_edge(&relation.target, &relation.source);
          graph.add_edge(&relation.source, &relation.target);
        }
      }
    });

  format!("{}", graph)
}

#[cfg(test)]
mod test {
  use fkl_parser::parse;
  use crate::dot_gen::to_dot;

  #[test]
  fn test_to_dot() {
    let context_map = parse(r#"
ContextMap {
  ShoppingCarContext -> MallContext;
  ShoppingCarContext <-> MallContext;
}
    "#).unwrap();
    let string = to_dot(&context_map);
    println!("{}", string);

    // assert_eq!(to_dot(&context_map), r#"digraph fkl {ShoppingCarContext [label=\"ShoppingCarContext\"];MallContext [label=\"MallContext\"];}"#);
  }
}
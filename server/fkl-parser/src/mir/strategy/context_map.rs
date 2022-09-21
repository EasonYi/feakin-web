use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
pub struct ContextMap {
  pub name: String,
  pub state: ContextState,
  pub contexts: Vec<BoundedContext>,
  pub relations: Vec<ContextRelation>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ContextState {
  AsIs,
  ToBe,
}

impl Default for ContextState {
  fn default() -> Self {
    ContextState::ToBe
  }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
pub struct BoundedContext {
  pub name: String,
}

impl BoundedContext {
  pub fn new(name: &str) -> Self {
    BoundedContext { name: name.to_string() }
  }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "camelCase")]
pub struct ContextRelation {
  pub source: String,
  pub target: String,
  pub connection_type: ConnectionDirection,
  pub source_type: ContextRelationType,
  pub target_type: ContextRelationType,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ConnectionDirection {
  Undirected,
  // -->
  PositiveDirected,
  // <--
  NegativeDirected,
  // <->
  BiDirected,
}

impl Default for ConnectionDirection {
  fn default() -> Self {
    ConnectionDirection::Undirected
  }
}

impl ConnectionDirection {
  pub fn from_connection(str: &str) -> Self {
    match str {
      "Undirected" | "-" | "--" => ConnectionDirection::Undirected,
      "PositiveDirected" | "->" => ConnectionDirection::PositiveDirected,
      "NegativeDirected" | "<-" => ConnectionDirection::NegativeDirected,
      "BiDirected" | "<->" => ConnectionDirection::BiDirected,
      _ => ConnectionDirection::Undirected,
    }
  }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum ContextRelationType {
  None,
  // Symmetric relation
  SharedKernel,
  Partnership,
  // Upstream Downstream
  CustomerSupplier,
  Conformist,
  AntiCorruptionLayer,
  OpenHostService,
  PublishedLanguage,
  SeparateWay,
  // added in book "DDD Reference"
  BigBallOfMud,
}

impl Default for ContextRelationType {
  fn default() -> Self {
    ContextRelationType::None
  }
}

impl ContextRelationType {
  pub fn from_str(str: &Option<String>) -> Self {
    match str {
      Some(str) =>
        match str.as_str() {
          "SharedKernel" | "SK" => ContextRelationType::SharedKernel,
          "Partnership" | "P" => ContextRelationType::Partnership,
          "CustomerSupplier" | "CS" => ContextRelationType::CustomerSupplier,
          "Conformist" | "C" => ContextRelationType::Conformist,
          "AntiCorruptionLayer" | "ACL" => ContextRelationType::AntiCorruptionLayer,
          "OpenHostService" | "OHS" => ContextRelationType::OpenHostService,
          "PublishedLanguage" | "PL" => ContextRelationType::PublishedLanguage,
          "SeparateWay" | "SW" => ContextRelationType::SeparateWay,
          "BigBallOfMud" | "BB" => ContextRelationType::BigBallOfMud,
          _ => {
            ContextRelationType::None
          }
        },
      None => ContextRelationType::None,
    }
  }
}
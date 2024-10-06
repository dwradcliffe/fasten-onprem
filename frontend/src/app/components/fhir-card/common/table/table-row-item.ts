import {ReferenceModel} from '../../../../../lib/models/datatypes/reference-model';
import {CodingModel} from '../../../../../lib/models/datatypes/coding-model';
import {CodableConceptModel} from '../../../../../lib/models/datatypes/codable-concept-model';

export class TableRowItem {
  label?: string
  data?: string | string[] | ReferenceModel | CodingModel | CodingModel[] | CodableConceptModel
  data_type?: TableRowItemDataType
  enabled?: boolean //determine if this row should be displayed
  link?: string
}

export enum TableRowItemDataType {
  String = "string",
  StringArray = "stringArray",
  Reference = "reference",
  Coding = "coding",
  CodingList = "codingList",
  CodableConcept = "codableConcept",
}

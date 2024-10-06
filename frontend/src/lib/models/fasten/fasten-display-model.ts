import {FastenOptions} from './fasten-options';
import {ResourceType} from '../constants';
import { HumanNameModel } from '../datatypes/human-name-model';

export class FastenDisplayModel {
  source_resource_type: ResourceType | undefined
  source_resource_id: string | undefined
  source_id: string | undefined
  sort_title: string | undefined
  sort_date: Date | undefined
  resource_type_description: string
  name: string | HumanNameModel = ""
  status: string | any

  related_resources: {[ modelResourceType: string]: FastenDisplayModel[]} = {}

  constructor(options?: FastenOptions) {}

  public get resource_type_friendly() : string {
    return this.source_resource_type?.replace(/([A-Z])/g, ' $1').trim()
  }

}

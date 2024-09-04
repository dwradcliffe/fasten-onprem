import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FORMATTERS } from 'src/app/components/fhir-datatable/datatable-generic-resource/utils';
import { OrganizationModel } from '../../../../../lib/models/resources/organization-model';
import { BadgeComponent } from '../../common/badge/badge.component';
import { TableRowItem, TableRowItemDataType } from '../../common/table/table-row-item';
import { TableComponent } from '../../common/table/table.component';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule],
  selector: 'fhir-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
  @Input() displayModel: OrganizationModel
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false
  @Input() isPopover: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) { }

  ngOnInit(): void {
    if (!this.isPopover) {
      for (let idCoding of (this.displayModel?.identifier || [])) {
        this.tableData.push({
          label: `Identifier (${idCoding.system})`,
          data: idCoding.display || idCoding.value,
          enabled: true,
        })
      }
    }

    for (let address of (this.displayModel?.addresses || [])) {
      let a = FORMATTERS.address(address)
      this.tableData.push({
        label: 'Address',
        data_type: TableRowItemDataType.StringArray,
        data: a,
        enabled: !!a,
      })
    }

    for(let telecom of (this.displayModel?.telecom || [])){
      this.tableData.push({
        label: telecom.system.charAt(0).toUpperCase() + telecom.system.slice(1),
        data: telecom.value,
        enabled: !!telecom.value,
      })
    }

    // this.tableData.push(
    //   {
    //     label: 'Contacts',
    //     data: this.displayModel?.telecom,
    //     data_type: TableRowItemDataType.CodingList,
    //     enabled: !!this.displayModel?.telecom,
    //   },
    //   {
    //     label: 'Type',
    //     data: this.displayModel?.type_codings,
    //     data_type: TableRowItemDataType.CodableConcept,
    //     enabled: !!this.displayModel?.type_codings && this.displayModel.type_codings.length > 0,
    //   }
    // )

  }
  markForCheck() {
    this.changeRef.markForCheck()
  }

}

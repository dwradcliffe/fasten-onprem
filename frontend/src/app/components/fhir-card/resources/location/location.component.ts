import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FORMATTERS } from 'src/app/components/fhir-datatable/datatable-generic-resource/utils';
import { LocationModel } from '../../../../../lib/models/resources/location-model';
import { BadgeComponent } from '../../common/badge/badge.component';
import { TableRowItem, TableRowItemDataType } from '../../common/table/table-row-item';
import { TableComponent } from '../../common/table/table.component';
import { FhirCardComponentInterface } from '../../fhir-card/fhir-card-component-interface';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule],
  selector: 'fhir-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, FhirCardComponentInterface {
  @Input() displayModel: LocationModel
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false
  @Input() isPopover: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) { }

  ngOnInit(): void {

    this.tableData.push(
      {
        label: 'Type',
        data: this.displayModel?.type?.[0],
        data_type: TableRowItemDataType.CodableConcept,
        enabled: !!this.displayModel?.type?.[0],
      },
      {
        label: 'Physical Type',
        data: this.displayModel?.physical_type,
        data_type: TableRowItemDataType.CodableConcept,
        enabled: !!this.displayModel?.physical_type && this.displayModel?.physical_type?.coding?.length > 0,
      },
      {
        label: 'Location Mode',
        data: this.displayModel?.mode,
        enabled: !!this.displayModel?.mode,
      },
      {
        label: 'Description',
        data: this.displayModel?.description,
        enabled: !!this.displayModel?.description,
      },
      {
        label: 'Managing Organization',
        data: this.displayModel?.managing_organization,
        data_type: TableRowItemDataType.Reference,
        enabled: !!this.displayModel?.managing_organization,
      }
    )

    let a = FORMATTERS.address(this.displayModel?.address)
    this.tableData.push({
      label: 'Address',
      data_type: TableRowItemDataType.StringArray,
      data: a,
      enabled: !!a,
    })

    for (let telecom of (this.displayModel?.telecom || [])) {
      this.tableData.push({
        label: telecom.system.charAt(0).toUpperCase() + telecom.system.slice(1),
        data: telecom.value,
        enabled: !!telecom.value,
      })
    }

  }
  markForCheck() {
    this.changeRef.markForCheck()
  }

}

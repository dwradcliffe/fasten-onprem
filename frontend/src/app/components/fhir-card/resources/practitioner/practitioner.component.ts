import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbCollapseModule } from "@ng-bootstrap/ng-bootstrap";
import { FORMATTERS } from 'src/app/components/fhir-datatable/datatable-generic-resource/utils';
import { PractitionerModel } from '../../../../../lib/models/resources/practitioner-model';
import { BadgeComponent } from "../../common/badge/badge.component";
import { TableRowItem, TableRowItemDataType } from '../../common/table/table-row-item';
import { TableComponent } from "../../common/table/table.component";
import { FhirCardComponentInterface } from '../../fhir-card/fhir-card-component-interface';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule],
  selector: 'fhir-practitioner',
  templateUrl: './practitioner.component.html',
  styleUrls: ['./practitioner.component.scss']
})
export class PractitionerComponent implements OnInit, FhirCardComponentInterface {
  @Input() displayModel: PractitionerModel | null
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false
  @Input() isPopover: boolean = false


  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) { }

  ngOnInit(): void {
    this.tableData = [
      {
        label: 'Gender',
        data: this.displayModel?.gender,
        enabled: !!this.displayModel?.gender,
      },
      // {
      //   label: 'Birth date',
      //   data: birthDate && <Date fhirData={birthDate} isBlack />,
      //   status: birthDate,
      // },
      // {
      //   label: 'Contact',
      //   data: isContactData && (
      //   <PatientContact
      //     name={contactData.name}
      //   relationship={contactData.relationship}
      //   />
      // ),
      //   status: isContactData,
      // },
    ];
    for (let idCoding of (this.displayModel?.identifier || [])) {
      if (idCoding.system == "http://hl7.org/fhir/sid/us-npi") {
        this.tableData.push({
          label: "NPI",
          data: idCoding.display || idCoding.value,
          link: `https://npiregistry.cms.hhs.gov/provider-view/${idCoding.display || idCoding.value}`,
          enabled: true,
        })
      } else if (!this.isPopover) {
        this.tableData.push({
          label: `Identifier (${idCoding.system})`,
          data: idCoding.display || idCoding.value,
          enabled: true,
        })
      }
    }
    if (this.displayModel?.address?.length > 0) {
      let address = FORMATTERS.address(this.displayModel?.address?.[0])
      this.tableData.push({
        label: 'Address',
        data_type: TableRowItemDataType.StringArray,
        data: address,
        enabled: !!address,
      })
    }
    for (let telecom of (this.displayModel?.telecom || [])) {
      let l = telecom.system.charAt(0).toUpperCase() + telecom.system.slice(1)
      this.tableData.push({
        label: l,
        data: telecom.value,
        link: l == "Email" ? `mailto:${telecom.value}` : null,
        enabled: !!telecom.value,
      })
    }
  }
  markForCheck() {
    this.changeRef.markForCheck()
  }
}

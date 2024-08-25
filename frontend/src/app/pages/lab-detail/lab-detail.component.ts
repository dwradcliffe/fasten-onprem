import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceFhir } from '../../models/fasten/resource_fhir';
import { FastenApiService } from '../../services/fasten-api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseWrapper } from 'src/app/models/response-wrapper';
import { ObservationModel } from 'src/lib/public-api';

@Component({
  selector: 'app-lab-detail',
  templateUrl: './lab-detail.component.html',
  styleUrls: ['./lab-detail.component.scss']
})
export class LabDetailComponent implements OnInit {
  loading: boolean = false
  errorMessage: string = null
  observationTitle: string = null
  observationCode: string = null
  observations: ResourceFhir[] = []
  observationModels: ObservationModel[] = []
  isEmptyReport: boolean = false

  // TODO: add date range controls

  constructor(
    private fastenApi: FastenApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.loading = true
    this.observationCode = this.route.snapshot.paramMap.get('code')
    this.fetchData().subscribe((response) => {
      this.observations = response.data
      this.isEmptyReport = !!!this.observations.length
      this.observationModels = this.observations.map(ob => new ObservationModel(ob.resource_raw))
      this.observationTitle = !!this.isEmptyReport ? null : this.observationModels[0].code_text
      this.loading = false
    }, error => {
      console.error(error)
      this.errorMessage = error
      this.loading = false
    });
  }

  fetchData(): Observable<ResponseWrapper> {
    return this.fastenApi.queryResources({
      select: [],
      from: "Observation",
      where: {
        "code": this.observationCode,
      },
      aggregations: {
        order_by: {
          field: "sort_date",
          fn: "max"
        }
      }
    })
    // .pipe(
    //     map((response: ResponseWrapper) => {
    //       return response.data as ResourceFhir[]
    //     }),
    // )
  }

}

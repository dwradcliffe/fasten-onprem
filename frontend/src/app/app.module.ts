import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from '@ng-select/ng-select';
import { NgChartsModule } from 'ng2-charts';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { HIGHLIGHT_OPTIONS, HighlightModule } from 'ngx-highlightjs';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MomentModule } from 'ngx-moment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IsAuthenticatedAuthGuard } from './auth-guards/is-authenticated-auth-guard';
import { ShowFirstRunWizardGuard } from './auth-guards/show-first-run-wizard-guard';
import { FhirCardModule } from './components/fhir-card/fhir-card.module';
import { FhirDatatableModule } from './components/fhir-datatable/fhir-datatable.module';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SharedModule } from './components/shared.module';
import { HTTP_CLIENT_TOKEN } from "./dependency-injection";
import { DirectivesModule } from './directives/directives.module';
import { IconsModule } from './icon-module';
import { AuthSigninComponent } from './pages/auth-signin/auth-signin.component';
import { AuthSignupWizardComponent } from './pages/auth-signup-wizard/auth-signup-wizard.component';
import { AuthSignupComponent } from './pages/auth-signup/auth-signup.component';
import { BackgroundJobsComponent } from './pages/background-jobs/background-jobs.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DesktopCallbackComponent } from './pages/desktop-callback/desktop-callback.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { MedicalHistoryComponent } from './pages/medical-history/medical-history.component';
import { MedicalSourcesComponent } from './pages/medical-sources/medical-sources.component';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';
import { LabDetailComponent } from './pages/lab-detail/lab-detail.component';
import { ReportLabsComponent } from './pages/report-labs/report-labs.component';
import { ResourceCreatorComponent } from './pages/resource-creator/resource-creator.component';
import { ResourceDetailComponent } from './pages/resource-detail/resource-detail.component';
import { SourceDetailComponent } from './pages/source-detail/source-detail.component';
import { PipesModule } from './pipes/pipes.module';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { AuthService } from './services/auth.service';
import { WidgetsModule } from './widgets/widgets.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    DashboardComponent,
    MedicalSourcesComponent,
    ResourceDetailComponent,
    AuthSignupComponent,
    AuthSigninComponent,
    SourceDetailComponent,
    PatientProfileComponent,
    MedicalHistoryComponent,
    ReportLabsComponent,
    LabDetailComponent,
    ResourceCreatorComponent,
    ExploreComponent,
    DesktopCallbackComponent,
    BackgroundJobsComponent,
    AuthSignupWizardComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    SharedModule,
    FhirCardModule,
    FhirDatatableModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    NgChartsModule,
    NgxDropzoneModule,
    HighlightModule,
    MomentModule,
    PipesModule,
    InfiniteScrollModule,
    NgSelectModule,
    WidgetsModule,
    DirectivesModule,
    IconsModule,
  ],
  providers: [
    {
      provide: HTTP_CLIENT_TOKEN,
      useClass: HttpClient,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
      deps: [AuthService, Router]
    },
    IsAuthenticatedAuthGuard,
    ShowFirstRunWizardGuard,
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'), // Optional, only if you want the line numbers
        languages: {
          json: () => import('highlight.js/lib/languages/json')
        },
      }
    }
  ],
  exports: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] //required for lhncbc/lforms (webcomponent)
})
export class AppModule { }

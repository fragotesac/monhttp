import {Component, OnInit} from '@angular/core';
import {ServiceService} from '../../services/service.service';
import {ErrorService} from '../../services/error.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, switchAll, switchMap, tap} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {Service, ServiceType} from '../../models/service.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiError} from '../../models/api-error.model';

@Component({
  selector: 'app-edit-service',
  templateUrl: './edit-service.component.html',
  styleUrls: ['./edit-service.component.scss']
})
export class EditServiceComponent implements OnInit {

  service$: Observable<Service>;

  formGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl('HTTP', [Validators.required]),
    intervalInSeconds: new FormControl(30, [Validators.required, Validators.min(30), Validators.max(1800)]),

    endpoint: new FormControl('', [Validators.required]),
    requestTimeoutInSeconds: new FormControl(1, [Validators.min(1), Validators.max(180)]),
    httpMethod: new FormControl('GET'),
    httpBody: new FormControl(''),
    httpHeaders: new FormControl(''),
    expectedHttpResponseBody: new FormControl(''),
    expectedHttpStatusCode: new FormControl(200),
    followRedirects: new FormControl(true),
    verifySsl: new FormControl(true),

    enableNotifications: new FormControl(true),
    notifyAfterNumberOfFailures: new FormControl(2, [Validators.min(0), Validators.max(20)])
  });

  selectedServiceType: ServiceType = 'HTTP';

  isLoading = false;
  serviceId = '';

  private serviceTypeSubscription: Subscription;

  constructor(private serviceService: ServiceService,
              private errorService: ErrorService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.service$ = this.route.params
      .pipe(
        map(params => params['id']),
        switchMap(id => this.serviceService.get(id)),
        tap(service => {
          this.serviceId = service.id;
          this.setFormGroupValues(service);
        })
      );

    this.serviceTypeSubscription = this.serviceType.valueChanges
      .subscribe((serviceType) => this.selectedServiceType = serviceType);
  }

  get serviceType(): FormControl {
    return this.formGroup.get('type') as FormControl;
  }

  setFormGroupValues(service: Service): void {
    this.formGroup.get('name').setValue(service.name);
    this.formGroup.get('type').setValue(service.type);
    this.formGroup.get('intervalInSeconds').setValue(service.intervalInSeconds);
    this.formGroup.get('endpoint').setValue(service.endpoint);
    this.formGroup.get('requestTimeoutInSeconds').setValue(service.requestTimeoutInSeconds);
    this.formGroup.get('httpMethod').setValue(service.httpMethod);
    this.formGroup.get('httpBody').setValue(service.httpBody);
    this.formGroup.get('httpHeaders').setValue(service.httpHeaders);
    this.formGroup.get('expectedHttpStatusCode').setValue(service.expectedHttpStatusCode);
    this.formGroup.get('followRedirects').setValue(service.followRedirects);
    this.formGroup.get('verifySsl').setValue(service.verifySsl);
    this.formGroup.get('enableNotifications').setValue(service.enableNotifications);
    this.formGroup.get('notifyAfterNumberOfFailures').setValue(service.notifyAfterNumberOfFailures);
  }

  updateService(): void {

    this.isLoading = true;

    const formValues = this.formGroup.value as Service;
    this.serviceService.put(this.serviceId, formValues)
      .pipe(
        tap(() => this.isLoading = false)
      ).subscribe(
      () => this.router.navigate(['services']),
      (error: ApiError) => this.errorService.setError(error)
    );

  }
}
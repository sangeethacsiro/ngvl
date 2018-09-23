import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { UserStateService } from '../../shared';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { routerTransition } from '../../router.animations';

import { Observable, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Job, Solution } from '../../shared/modules/vgl/models';
import { JobObjectComponent } from './job-object.component';
import { JobSolutionsSummaryComponent } from './job-solutions-summary.component';
import { JobDatasetsComponent } from './job-datasets.component';

@Component({
  selector: 'app-job-wizard',
  templateUrl: './job-wizard.component.html',
  styleUrls: ['./job-wizard.component.scss'],
  animations: [routerTransition()]
})
export class JobWizardComponent implements OnInit, OnDestroy {

  jobIncomplete: boolean = false;
  cancelled: boolean = false;

  solutions: Solution[];
  private _solutionsSub;

  private routeSub;

  @ViewChild(JobObjectComponent)
  private jobObject: JobObjectComponent;

  @ViewChild(JobSolutionsSummaryComponent)
  private solutionsComponent: JobSolutionsSummaryComponent;

  @ViewChild(JobDatasetsComponent)
  private jobDatasetsComponent: JobDatasetsComponent;

  constructor(private userStateService: UserStateService,
              private vglService: VglService,
              private location: Location,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    // Check the URL and parameters to determine whether we're creating a new
    // job or loading an existing one.
    this.routeSub = combineLatest(this.route.url, this.route.paramMap).pipe(
      switchMap(([parts, params]) => {
        if (parts[0].path == 'new') {
          // Load a new, empty job object for the user to manage.
          return this.userStateService.newJob();
        }
        else if (parts[0].path == 'job' && params.has('id')) {
          // Load the specified job from the server
          const id = parseInt(params.get('id'));
          return this.userStateService.loadJob(id);
        }
      })
    ).subscribe(() => {
        // Only load job downloads after job has loaded
        this.jobDatasetsComponent.loadJobInputs();
    });

    this._solutionsSub = this.userStateService.selectedSolutions.subscribe(
      solutions => this.solutions = solutions
    );
  }

  ngOnDestroy() {
    // Store the current job object in the userStateService unless cancelled. Might not work with a viewchild?
    if (!this.cancelled) {
      this.stashUserState();
    }

    // Clean up subs
    this._solutionsSub.unsubscribe();
    this.routeSub.unsubscribe();
  }

  save() {
    this.doSave().subscribe(resp => {
      console.log('Saved: ' + resp);
    });
  }

  submit() {
    // Save the job first, then submit it an navigate away.
    this.doSave().subscribe(savedJob => {
      this.vglService.submitJob(savedJob).subscribe(
        submitted => {
          this.router.navigate(['/jobs']);
        },
        error => {
          console.log('Failed to submit job: ' + error);
        }
      );
    });
  }

  private doSave(): Observable<Job> {
    // Store the current user state.
    this.stashUserState();

    // Save the job to the backend
    return this.vglService.saveJob(this.userStateService.getJob(),
                                   this.userStateService.getJobDownloads(),
                                   this.userStateService.getJobTemplate(),
                                   this.userStateService.getSolutionsCart());
  }

  cancel() {
    this.cancelled = true;
    this.stashUserState();
    this.location.back();
  }

  getJobObject(): Job {
    return this.jobObject.getJobObject();
  }

  getTemplate(): string {
    return this.solutionsComponent.template;
  }

  private stashUserState() {
    // Store the current state of the job object in the user state.
    this.userStateService.updateJob(this.getJobObject());

    // Update the current template
    this.userStateService.updateJobTemplate(this.getTemplate());
  }

}

import 'zone.js/dist/zone';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { ObservableState } from './observable-state';
import { map } from 'rxjs';

class User {
  public firstName = '';
  public lastName = '';
  public passwords = {
    password: '',
    confirmPassword: '',
  };
  constructor(user?: Partial<User>) {
    if (user) {
      Object.assign(this, { ...user });
    }
  }
}
@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <form #form="ngForm" *ngIf="vm$|async as vm" (ngSubmit)="submit()">
      <label>
        First name
        <input type="text" [ngModel]="vm.user.firstName" name="firstName"/>
      </label>
      <label>
        Last name
        <input type="text" [ngModel]="vm.user.lastName" name="lastName"/>
      </label>
      <h2>Password</h2>
      <div ngModelGroup="passwords" *ngIf="vm.showPasswords">
        <label>
          Password
          <input
            type="password"
            [ngModel]="vm.user.passwords.password" name="password"/>
        </label>
        <label>
          Confirm password
          <input
            [disabled]="vm.confirmPasswordDisabled"
            [ngModel]="vm.user.passwords.confirmPassword" name="confirmPasswords"
            type="password"
          />
        </label>
      </div>
      <button>Submit form</button>
  </form>
  `,
})
export class App
  extends ObservableState<{ user: User; firstName: string }>
  implements AfterViewInit
{
  @ViewChild('form') form!: NgForm;
  public readonly vm$ = this.onlySelectWhen(['user']).pipe(
    map((state) => {
      return {
        user: state.user,
        confirmPasswordDisabled: state.user.passwords.password === '',
        showPasswords: state.user.firstName !== '',
      };
    })
  );

  constructor() {
    super();
    this.initialize({
      user: new User(),
      firstName: '',
    });
    this.select('firstName').subscribe(() => {
      // do something fancy
      console.log('first name has changed');
    });
  }

  public ngAfterViewInit(): void {
    this.connect({
      user: this.form.valueChanges?.pipe(
        map((v) => new User({ ...this.snapshot.user, ...v }))
      ),
      firstName: this.onlySelectWhen(['user']).pipe(
        map((state) => state.user.firstName)
      ),
    });
  }
  public submit(): void {
    console.log(this.form);
  }
}

bootstrapApplication(App);

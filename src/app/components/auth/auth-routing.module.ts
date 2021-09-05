import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { VerifyUserProfileComponent } from '../verify-user-account/verify-user-profile.component';
import { PasswordResetComponent } from '../password-reset/password-reset.component';

const routes: Routes = [
    { path: 'signup', component: SignupComponent },
    { path: 'login', component: LoginComponent },
    { path: 'verify', component: VerifyUserProfileComponent },
    { path: 'passwordreset', component: PasswordResetComponent }
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
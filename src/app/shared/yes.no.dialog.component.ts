import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-yes-no-dialog',
    template: `<h1 mat-dialog-title>{{ passedData.title }}</h1>
    <mat-dialog-content>
        <p>{{ passedData.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions>
        <button mat-button [mat-dialog-close]="true">Yes</button>
        <button mat-button [mat-dialog-close]="false">No</button>
    <mat-dialog-actions>`
})

export class YesNoDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {
    }
}
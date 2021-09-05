import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Category } from '../../models/category.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-category-add',
  templateUrl: './category-add.component.html',
  styleUrls: ['./category-add.component.scss']
})

export class CategoryAddComponent {

  constructor(private dialogRef: MatDialogRef<CategoryAddComponent>) {
  }
  
  onSave(form: NgForm) {
    const category = { name: form.value.name, createdDate: new Date() } as Category;
    this.dialogRef.close({ data: category });
  }
}
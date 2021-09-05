import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { YesNoDialogComponent } from '../../shared/yes.no.dialog.component';
import { Category } from '../../models/category.model';
import { CategoryAddComponent } from '../category-add/category-add.component';
import { UiService } from '../../services/ui.service';
import { CategoryService } from 'src/app/services/category.service';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from 'src/app/reducers/app.reducer';
import * as UI from 'src/app/actions/ui.actions';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit, OnDestroy {
  displayedColumns = ['CreatedDate', 'Name', 'Actions'];
  dataSource = new MatTableDataSource<Category>();
  isLoading$: Observable<boolean>;
  userTimeZone = '';

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  private allSubscriptions: Subscription[] = [];
  
  editCategory: Category;
  oldCategory: { id: number; userId: string; name: string; createdDate?: Date; };
  rowInEditMode: boolean;
  
  constructor(private dialog: MatDialog, private uiService: UiService,
              private categoryService: CategoryService,
              private userService: UserService,
              private store: Store<{ui: fromRoot.State}>) { }

  ngOnInit() {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.allSubscriptions.push(this.userService.getUserSettings.subscribe((user: User) => {
      this.userTimeZone = user.stateTimeZone.utc;
    }));
  }

  private createCategory(category: Category) {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.categoryService.createCategory(category).subscribe(response => {
      if (response.ok) {
        const categoryCreated = response.body as Category;
        this.pushCategoryToDataSource(categoryCreated);

        this.uiService.showSnackBar('Category was sucessfully created.', 3000);
      } else {
        this.uiService.showSnackBar('There was an error while creating a category, please, try again later.', 3000);
      }
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while creating category. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }

  private deleteCategory(category: Category) {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.categoryService.deleteCategory(category.id).subscribe(response => {
      this.removeCategoryFromDataSource(category.id);
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while deleting category. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  openDialog() {
      const dialogRef = this.dialog.open(CategoryAddComponent);
      this.allSubscriptions.push(dialogRef.afterClosed().subscribe(result => {
        if (result && result.data) {
          this.createCategory(result.data as Category);
        }
      }));
  }

  onSave(form: NgForm) {
    this.createCategory({ name: form.value.name, createdDate: new Date() } as Category);
  }

  onDelete(category: Category) {
    if (!category.canBeDeleted) {
      this.uiService.showSnackBar('This category has expenses linked to it, therefore, it cannot be removed.', 3000);
    } else {
      const dialogRef = this.dialog.open(YesNoDialogComponent,
      {
        data:
          {
            message: 'Are you sure you want to delete this category?',
            title: 'Are you sure?'
          }
      });
      this.allSubscriptions.push(dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.deleteCategory(category);
        }
      }));
    }
  }

  onUpdate() {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.categoryService.updateCategory(this.editCategory).subscribe(response => {
      if (response.ok) {
        this.categoryService.setCategories = this.dataSource.data;
        this.uiService.showSnackBar('Category successfully updated.', 3000);
        } else {
          this.uiService.showSnackBar('There was an error while trying to update category. Please, try again later!', 3000);
        }
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while updating category. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.onCancelEdit();
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }

  private refreshCategoryDataSource() {
    this.allSubscriptions.push(this.categoryService.getCategories.subscribe((categories: Category[]) => {
      this.dataSource = new MatTableDataSource(categories);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }));
 }

  private removeCategoryFromDataSource(categoryId: number) {
    const categoriesFromDataSource = this.dataSource.data;
    const categoryIndex = categoriesFromDataSource.findIndex(x => x.id === categoryId);
    if (categoryIndex > -1) {
      categoriesFromDataSource.splice(categoryIndex, 1);
    }
    this.categoryService.setCategories = categoriesFromDataSource;
  }
  
  private pushCategoryToDataSource(categoryCreated: Category) {
    this.dataSource.data.push(categoryCreated);
    this.categoryService.setCategories = this.dataSource.data;
  }

  onEdit(category: Category) {
    this.editCategory = category && category.id ? category : {} as Category;
    this.oldCategory = {...this.editCategory};
    this.rowInEditMode = true;
  }

  onCancelEdit(){
    this.rowInEditMode = false;
    this.editCategory = {} as Category;
    this.oldCategory = {} as Category;
  }

  ngAfterViewInit() {
    this.allSubscriptions.push(this.isLoading$.subscribe(loading => {
      if (loading) {
        setTimeout(() => {
          this.refreshCategoryDataSource();
        }, 500);
      } else {
        this.refreshCategoryDataSource();
      }
    }));
  }

  ngOnDestroy(): void {
    this.allSubscriptions.forEach(s => { s.unsubscribe()});
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup , Validators} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService, AuthService } from 'src/app/core/services';
@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {

  successMessage;
  errorMessage;
  users: any[] = [];
  userList: any[] = [];
  propertyList: any[] = [];
  topicList: any[] = [];
  selectedUser:any = {}
  selectedProperty: any = {};
  selectedTopic: any = {};
  selectedUserId : any ;
  selectedPropertyId: any ;
  selectedTopicId: any ;
  form: FormGroup;
  isFormSubmitted = false;
  isEdit = true;
  user: any = {};
  disableAddButton = false;

  selectedProperties: any[] = []; // store multiple
  selectedRangeOption: any[] = [];

  constructor(private spinner: NgxSpinnerService,
              private adminService: AdminService,
              private authService: AuthService,
              private formBuilder: FormBuilder, ) { }

  ngOnInit(): void {
    console.log("init");
    this.buildForm();
    this.getUser();
    this.showSpinner('sp5');
    this.selectedTopicId='';
    this.selectedPropertyId='';
    this.isEdit = false;
    this.selectedRangeOption = []; 
    this.getAllProperties();
  }

  // tslint:disable-next-line:typedef
  getUser() {
    const userData = this.authService.getUser();
    this.user = JSON.parse(userData);
  }

    // tslint:disable-next-line:typedef


  // tslint:disable-next-line:typedef
  addTopic() {
    this.isEdit = false;
    this.selectedTopic = null;
    this.selectedTopicId = '';
    this.form.patchValue({
      topicKey: '',
      topicValue: '',
      topicId: ''
    });
  }
  

  // tslint:disable-next-line:typedef
  updateFormValues() {
    if(this.selectedTopic)
    {
      this.form.patchValue({
        topicKey: this.selectedTopic.label,
        topicValue: this.selectedTopic.value,
        topicId: this.selectedTopic.topicId
      });
    } else {
      this.form.patchValue({
        topicKey: '',
        topicValue: '',
        topicId: ''
      });
    }    
  }

  get f() {
    return this.form && this.form.controls;
  }

  onUserPropertiesSelected(value)
  {
    this.showSpinner('sp5');
    this.updateTopicList(value);
    this.addTopic();
    this.hideSpinner('sp5');
  }

  // onPropertyChange(value: string) {
  //   this.selectedPropertyId = value;
  //   this.selectedProperty = this.propertyList.find(p => p.value === value);
  //   this.updateTopicList(value);
  // }
onPropertySelectionChange(selectedValues: any[]) {
  console.log('Selected Property Values:', selectedValues);

  this.selectedProperties = selectedValues;

  if (!selectedValues || selectedValues.length === 0) {
    // Reset everything
    this.topicList = [];
    this.selectedTopic = null;
    this.selectedTopicId = '';
    return;
  }

  // Get all SELECTED property objects
  const selectedProps = this.propertyList.filter(p =>
    selectedValues.includes(p.value)
  );

  // ---- INTERSECTION LOGIC ----
  let intersectionTopics = selectedProps[0].topics.map(t => ({
    key: t.key,
    value: t.values,
    uuid: t.uuid
  }));

  for (let i = 1; i < selectedProps.length; i++) {
    const currentTopics = selectedProps[i].topics.map(t => t.key);

    intersectionTopics = intersectionTopics.filter(t =>
      currentTopics.includes(t.key)
    );
  }

  // Create dropdown list
  this.topicList = intersectionTopics.map(topic => ({
    label: topic.key,
    value: topic.value,
    topicId: topic.uuid
  }));

  // Sort alphabetically
  this.topicList.sort((a, b) => a.label.localeCompare(b.label));

  // Reset topic selection
  this.selectedTopic = null;
  this.selectedTopicId = '';

  console.log("Final Intersected Topics:", this.topicList);
}



onUserTopicSelected(value: string) {
  this.showSpinner('sp5');

  const topic = this.topicList.find(t => t.label === value);
  this.selectedTopic = topic || null;
  this.isEdit = !!topic;

  this.updateFormValues();
  this.hideSpinner('sp5');
}


  buildForm() {
    this.form = this.formBuilder.group({
      topicKey: [''],
      topicValue: [''],
      topicId: ['']
    });
  }

  properties: any[] = [];

  getAllProperties() {
    this.showSpinner('sp5');
    this.propertyList = []
    this.adminService.getAllProperties().subscribe(
      (response: any) => {
        this.properties = response;
        console.log("this is deta" , this.properties) ,
        // this.properties.map((property) =>
        //   this.propertyList.push({
        //     value: property.uuid,
        //     label: property.propertyName,  // full object
        //   })
        // );
        this.propertyList = this.properties.map((property) => ({
          value: property.uuid,
          label: property.propertyName,
           topics: property.topics || [] 
        }));
        console.log("this.propertyList ",this.propertyList);
  
        // this.propertyList = this.propertyList && this.propertyList.sort(function (a, b) {
        //   return a.label.propertyName.localeCompare(b.label.propertyName);
        // });
        this.propertyList = this.propertyList.sort((a, b) =>
          a.label.localeCompare(b.label)
        );
        

        console.log("this.selectedPropertyId " + this.selectedPropertyId);
        if(this.selectedPropertyId)
        {
          const propertyData = this.propertyList.filter((u) => u.value === this.selectedPropertyId)
          this.selectedUser = propertyData && propertyData[0];
        }
        else{
          // TODO: Do same for property component
          this.selectedProperty = null;
          this.selectedPropertyId = '';
        }
        if (!this.selectedPropertyId)
        {
          //this.userList.length > 0 && this.updatePropertyList(this.selectedUserId);
        } 
        this.hideSpinner('sp5');
      },
      (error: any) => {
        this.hideSpinner('sp5');
        this.errorMessage = error.message
          ? error.message
          : 'Internal Server Error ! Please Try Again';
      }
    );

    this.updateFormValues();
  }

//   getAllProperties() {
//   this.showSpinner('sp5');
//   this.propertyList = [];

//   // 🔹 Fake API response (simulate what backend would return)
//   const fakeResponse = [
//     {
//       uuid: 'prop-001',
//       propertyName: 'Hotel Sunrise',
//       topics: [
//         { uuid: 'topic-101', key: 'Breakfast', values: 'Included' },
//         { uuid: 'topic-102', key: 'Pool', values: 'Open 9AM-6PM' }
//       ]
//     },
//     {
//       uuid: 'prop-002',
//       propertyName: 'Resort Blue Lagoon',
//       topics: [
//         { uuid: 'topic-201', key: 'Spa', values: 'Available' },
//         { uuid: 'topic-202', key: 'Wi-Fi', values: 'Free' }
//       ]
//     },
//     {
//       uuid: 'prop-003',
//       propertyName: 'City Inn',
//       topics: [
//         { uuid: 'topic-301', key: 'Parking', values: 'Free' },
//         { uuid: 'topic-302', key: 'Gym', values: '24 Hours' }
//       ]
//     }
//   ];

//   // 🔹 Map fake response into your dropdown format
//   this.propertyList = fakeResponse.map(property => ({
//     value: property.uuid,
//     label: property.propertyName,
//     topics: property.topics
//   }));

//   this.propertyList.sort((a, b) => a.label.localeCompare(b.label));

//   // 🔹 Simulate API delay
//   setTimeout(() => {
//     console.log('Fake Property List for Testing:', this.propertyList);
//     this.hideSpinner('sp5');
//   }, 800);
// }




  clearMessage()
  {
    this.errorMessage = '';
  }

updateTopicList(propertyIds: string[], keepSelectedTopic = false) {

  this.topicList = [];

  // If only one property selected → normal behavior
  if (propertyIds.length === 1) {
    const property = this.propertyList.find(p => p.value === propertyIds[0]);

    if (!property || !property.topics) return;

    this.topicList = property.topics.map(topic => ({
      label: topic.key,
      value: topic.values,
      topicId: topic.uuid,
      propertyId: property.value
    }));

    this.topicList.sort((a, b) => a.label.localeCompare(b.label));

    if (!keepSelectedTopic) {
      this.selectedTopic = null;
      this.selectedTopicId = '';
    }
    return;
  }

  // MULTIPLE PROPERTIES → FIND INTERSECTION
  let intersection = null;

  propertyIds.forEach((id, index) => {
    const property = this.propertyList.find(p => p.value === id);

    if (!property || !property.topics) return;

    const topicKeys = property.topics.map(t => t.key);

    if (index === 0) {
      intersection = topicKeys;
    } else {
      intersection = intersection.filter(key => topicKeys.includes(key));
    }
  });

  // Now intersection = only the common topic keys
  this.topicList = [];

  // Build topic objects from intersection
  propertyIds.forEach(id => {
    const property = this.propertyList.find(p => p.value === id);

    property.topics.forEach(topic => {
      if (intersection.includes(topic.key)) {
        this.topicList.push({
          label: topic.key,
          value: topic.values,
          topicId: topic.uuid,
          propertyId: id
        });
      }
    });
  });

  // Remove duplicates (since same key from each property)
  this.topicList = this.topicList.filter(
    (v, i, arr) => arr.findIndex(t => t.label === v.label) === i
  );

  this.topicList.sort((a, b) => a.label.localeCompare(b.label));

  if (!keepSelectedTopic) {
    this.selectedTopic = null;
    this.selectedTopicId = '';
  }
}

  

  submit() {
    console.log("submit" + this.selectedProperty?.label?.uuid);
    if (!this.selectedProperty?.label?.uuid) {
      this.errorMessage = 'Please select a property before submitting.';
      return;
    }

    const data = {
      propertyId: this.selectedProperty.label.uuid,
      topicKey: this.form.value.topicKey,
      topicValue: this.form.value.topicValue
    };
  
    const onSuccess = (message: string) => {
      this.successMessage = message;
      this.form.patchValue({
        topicKey: '',
        topicValue: '',
        topicId: ''
      });
      this.selectedTopicId = '';
      this.selectedTopic = null;
      this.isEdit = false;
    
      this.refreshPropertiesAndTopics(() => {
        this.addTopic(); // reset form after topics refreshed
      });
    };
  
    this.showSpinner('sp5');
  
    if (this.isEdit) {
      this.adminService.updateTopic(this.form.value.topicId, data).subscribe(
        () => onSuccess('Topic Updated Successfully'),
        (error) => {
          this.hideSpinner('sp5');
          this.errorMessage = error.message || 'Internal Server Error ! Please Try Again';
        }
      );
    } else {
      this.adminService.addTopic(data).subscribe(
        () => onSuccess('Topic Added Successfully'),
        (error) => {
          this.hideSpinner('sp5');
          this.errorMessage = error.message || 'Internal Server Error ! Please Try Again';
        }
      );
    }
  }
  
  trackByProperty(index: number, item: any): string {
    return item.value;
  }

  refreshPropertiesAndTopics(callback?: () => void) {
    this.adminService.getAllProperties().subscribe(
      (res: any) => {
        this.properties = res;
        this.propertyList = [];
  
        this.properties.forEach((property) => {
          this.propertyList.push({
            value: property.uuid,
            label: property.propertyName
          });
        });
  
        this.propertyList = this.propertyList.sort((a, b) =>
          a.label.propertyName.localeCompare(b.label.propertyName)
        );

        console.log('Selected Property ID after refresh:', this.selectedPropertyId);
console.log('Dropdown Options:', this.propertyList.map(p => p.value));
  
        // Restore selectedProperty
        const matchedProperty = this.propertyList.find(p => p.value === this.selectedPropertyId);
        if (matchedProperty) {
          // Only update internal object reference
          this.selectedProperty = matchedProperty;
          this.selectedPropertyId = matchedProperty?.value || '';
        }
        this.selectedPropertyId = matchedProperty?.value || '';
  
        // Update topic list but reset topic selection
        this.updateTopicList(this.selectedPropertyId, false);
  
        if (callback) callback();

        console.log('Selected Property ID after refresh:', this.selectedPropertyId);
console.log('Dropdown Options:', this.propertyList.map(p => p.value));
  
        this.hideSpinner('sp5');
      },
      (error: any) => {
        console.error('Property fetch error => ', error);
        this.errorMessage = error.message || 'Internal Server Error ! Please Try Again';
        this.hideSpinner('sp5');
      }
    );
  }
  

  showSpinner(name: string) {
    this.spinner.show(name);
  }

  hideSpinner(name: string) {
    this.spinner.hide(name);
  }


}

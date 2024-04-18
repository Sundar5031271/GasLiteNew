import { Component, ViewChild, Inject, ElementRef, Input, AfterViewInit,Renderer2 } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { CrudService } from '../../services/crud.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';
declare const Tiff: any;
@Component({
  selector: 'app-search-operations',
  templateUrl: './search-operations.component.html',
  styleUrls: ['./search-operations.component.css']
})
export class SearchOperationsComponent {
  searchForm!: FormGroup;
  uploadForm!: FormGroup;

  currentURL = "https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.docx"

  constructor(
    private crd: CrudService,
    private formBuilder: FormBuilder,
    private router: Router,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  tableValuesobj: any;
  dataSource1: any;
  displayedColumns1 = ['fileType', 'objectName', 'actions'];
  openTableFlag: boolean = false;
  // urlSafe!: SafeResourceUrl;
  urlSafe: any;
  objButtonFlag: boolean = true;
  ObjFormFlag: boolean = false;

  docTypeVal: FormControl = new FormControl('',[
    Validators.required
  ]);

  caseidinputVal: FormControl = new FormControl('',[
    Validators.required,
    Validators.pattern(/^-?(0|[1-9]\d*)?$/)
  ]);

  uploadDocVal: FormControl = new FormControl('',[
    Validators.required
  ]);

  caseidVal: FormControl = new FormControl('',[
    Validators.required,
    Validators.pattern(/^-?(0|[1-9]\d*)?$/)
  ]);

  ngOnInit(): void {

    this.searchForm = this.formBuilder.group({
      caseid: [''],
      casevalue: ['']
    });

    this.uploadForm = this.formBuilder.group({
      docType: this.docTypeVal,
      caseidinput: this.caseidinputVal,
      uploadDoc: this.uploadDocVal
    })

  }

  viewDoc: boolean = false;
  nodataFound: any = [];

  searchOperations() {
    this.spinner.show();
    if(this.searchForm.valid) {
      if(this.searchForm.value.caseid === null) {
        var caseid = '';
      } else {
        caseid = this.searchForm.value.caseid;
      }
      if(this.searchForm.value.casevalue === null) {
        var caseValue = '';
      } else {
        caseValue = this.searchForm.value.casevalue;
      }
      
      this.showOperations(caseid, caseValue);
      
    } else {
      // this.searchForm.markAllAsTouched();
    }
  }

  showOperations(caseid: any, caseValue: any) {
    this.crd.searchOperation(caseid, caseValue)
      .subscribe((data: any) => {
        console.log(data)
        if(data['status'] === 'S') {
          this.searchForm.reset();
          this.spinner.hide();
          this.openTableFlag = true;
          this.tableValuesobj = data.obj;
          this.dataSource1 = new MatTableDataSource(this.tableValuesobj);
          setTimeout(() => {
            this.dataSource1.paginator = this.paginator;
            this.dataSource1.sort = this.sort;
          }, 100);
          // this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(data.obj[5].uri);
          this.urlSafe = data.obj[1].uri;
          // this.urlSafe = "https://view.officeapps.live.com/op/embed.aspx?src=https://stackblitz.com/storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdkpMIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e75389b18343665404852ed4cba8bd25938fa9bd/file-sample_1MB.doc";
          // console.log(this.urlSafe);
          this.getBase64ImageFromUrl(this.urlSafe);
          this.openDocFlag = true;
        } else {
          if(data.obj === null) {
            this.nodataFound = [];
          }
          console.log(this.nodataFound.length);
          this.dataSource1 = new MatTableDataSource(this.nodataFound);
          setTimeout(() => {
            this.dataSource1.paginator = this.paginator;
            this.dataSource1.sort = this.sort;
          }, 100);
          this.searchForm.reset();
          this.spinner.hide();
          this.toastr.error(data['statusMsg'], 'Error');
        }
      });
  }
 

  base64urlImg: any;
  openDocFlag: boolean = false;
  binString: any;
  async getBase64ImageFromUrl(imageUrl: any) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();

    console.log(res)
    console.log(blob)
  
    this.base64urlImg = await new Promise((resolve, reject) => {
      var reader  = new FileReader();
      reader.addEventListener("load", function () {
          resolve(reader.result);
      }, false);
  
      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);

    })
    // console.log(this.base64urlImg);
    // this.binString = atob(this.base64urlImg.replace(/-/g, "+").replace(/_/g, "/"));
    // console.log(this.binString);
    return this.base64urlImg;
  }

  searchOpt() {
    this.searchOperations();
  }

  typeList = [
    {id: 'aadhaar_front', name: 'aadhaar_front'},
    {id: 'aadhaar_rear', name: 'aadhaar_rear'},
    {id: 'customer_face', name: 'customer_face'},
    {id: 'driver_front', name: 'driver_front'},
    {id: 'driver_rear', name: 'driver_rear'},
    {id: 'misc', name: 'misc'},
    {id: 'pan_front', name: 'pan_front'},
    {id: 'pan_rear', name: 'pan_rear'},
    {id: 'passport_front', name: 'passport_front'},
    {id: 'passport_rear', name: 'passport_rear'},
    {id: 'voter_front', name: 'voter_front'},
    {id: 'voter_rear', name: 'voter_rear'}
  ]

  docType: any;
  typeSelect(eve: any) {
    this.docType = eve.name;
    // console.log(eve.name);
  }

  uploadOpt() {
    if(this.uploadForm.valid) {
      this.spinner.show();
      this.crd.uploadObj(this.docType, this.uploadForm.value.caseidinput, this.upSupportingFile)
      .subscribe((data:any) => {
        console.log(data);
        if(data['status'] === 'S') {
          this.spinner.hide();
          this.objButtonFlag = true;
          this.ObjFormFlag = false;
          this.showOperations(this.uploadForm.value.caseidinput, '');
          this.toastr.success(data['statusMsg'], 'Success');
        } else {
          this.toastr.error(data['statusMsg'], 'Error');
          this.spinner.hide();
        }
      })
    } else {
      this.uploadForm.markAllAsTouched();
    }    
  }
  
  upSupportingFile: File[] = [];
  onFileSelected(eve: any) {
    // console.log(eve);
    let selectedFile = eve.target.files[0];
    // console.log(selectedFile);
    let upFile = eve.target.files;
    this.upSupportingFile = [];
    for (var i = 0; i < upFile.length; i++) {
      this.upSupportingFile.push(upFile[i]);
    }
  }  

  viewRow(eve: any) {
    this.spinner.show();
    if(eve.fileType === 'image/jpeg' || eve.fileType === 'image/png' || eve.fileType === 'image/tiff') {
      this.dialog.open(DialogElementsModal, {
        width: '1024px',
        data: eve
      });
      setTimeout(() => {
        this.spinner.hide();
      }, 2000);
    } else if(eve.fileType === 'application/pdf') {
      this.dialog.open(DialogElementsModalPDF, {
        width: '1024px',
        data: eve
      });
      this.spinner.hide();
    }
  }

  DownloadRow(eve: any) {
    console.log(eve);
  }

  newObj() {
    this.objButtonFlag = false;
    this.ObjFormFlag = true;
    this.searchForm.reset();
  }

  showObj() {
    this.objButtonFlag = true;
    this.ObjFormFlag = false;
    this.uploadForm.reset();
  }
}


@Component({
  selector: 'docViewModal',
  templateUrl: 'docViewModal.html'
})
export class DialogElementsModal {

  pdfFlag: boolean = true;

  constructor(
    private renderer: Renderer2,
    public dialogRef: MatDialogRef<DialogElementsModal>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

    modaldata = this.data;
    modaldataurl = this.data.uri;
    ngOnInit(): void {
      console.log(this.modaldata.fileType);
      console.log(this.modaldata.uri);
      if( this.modaldata.fileType === 'image/tiff') {
        this.convertTifToPng()
      }
      
      // if(this.modaldata.fileType === 'application/pdf') { 
      //   alert('pdf')
      //   this.pdfFlag = true;
      //   this.modaldataurl = this.data.uri;
      // } else if (this.modaldata.fileType === 'image/png' || this.modaldata.fileType  === 'image/jpeg' || this.modaldata.fileType  === 'image/jpg') {
      //   alert('img')
      //   this.modaldataurl = this.data.uri;
      //   this.pdfFlag = false;
      // }
    }  
    
    @ViewChild('imgcontainer') 'imgcontainer': ElementRef;
    @ViewChild('img') 'img': ElementRef;
    
    // width = 100;
    // zoomIn() {
    //   let width = this.width++;
    //   this.img.nativeElement.style.width = width+'%';
    //   console.log(this.img.nativeElement.style.width)
    // }

    // zoomOut() {
    //   let width = this.width--;
    //   this.img.nativeElement.style.width = width+'%';
    //   console.log(this.img.nativeElement.style.width)
    // }

  
    @ViewChild('carousel') carousel!: ElementRef;
    @ViewChild('imageRef') imageRef!: ElementRef;
    @Input() images: string[] = []; // Input property to receive the images array
    slideIndex: number = 0;
    autoSlideSubscription!: Subscription;
    zoomLevel: number = 1;
    isZoomed: boolean = false;
    isDragging: boolean = false;
    startX: number = 0;
    startY: number = 0;
    translateX: number = 0;
    translateY: number = 0;
    tiffImage: any;
  pngImages: any[] = [];
  // images: any;
  tiffArray: any [] = [];
  // declare const Tiff: any;
convertTifToPng(): void {
    const tifImagePath = this.modaldataurl;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', tifImagePath, true);
    xhr.responseType = 'arraybuffer';
 
    xhr.onload = () => {
      const tiffData = new Uint8Array(xhr.response);
      this.tiffImage = new Tiff({ buffer: tiffData });
      let numpages=this.tiffImage.countDirectory();
      console.log(numpages);
 
     
      for (let pageIndex = 0; pageIndex < numpages; pageIndex++) {
       
        this.tiffImage.setDirectory(pageIndex);
 
       
        const pngData = this.tiffImage.toCanvas().toDataURL('image/png');
 
       
        // this.pngImages.push({'image': pngData, 'thumbImage': pngData});
        this.pngImages.push(pngData);
      }
      this.images = this.pngImages;
      console.log(this.images);
      console.log(this.images.length);
      for(var i = 0; this.images.length > i; i++) {
        let imagess = this.tiffArray.push({'image': this.pngImages})
      }
    };
 
    xhr.send();
  }

  showSlides(): void {
    if (!this.carousel) return; // Check if carousel is initialized
    const slides = this.carousel.nativeElement.children;
    if (this.slideIndex >= slides.length) {
      this.slideIndex = 0;
    }
    if (this.slideIndex < 0) {
      this.slideIndex = slides.length - 1;
    }
    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = 'none';
    }
    slides[this.slideIndex].style.display = 'block';
  }

  nextSlide(): void {
    this.slideIndex++;
    this.showSlides();
  }

  prevSlide(): void {
    this.slideIndex--;
    this.showSlides();
  }

  // startAutoSlide(): void {
  //   this.autoSlideSubscription = interval(5000).subscribe(() => {
  //     if (!this.isDragging) {
  //       if (!this.isZoomed) {
  //         this.nextSlide();
  //       }
  //     }
  //   });
  // }

  stopAutoSlide(): void {
    if (this.autoSlideSubscription) {
      this.autoSlideSubscription.unsubscribe();
    }
  }

  zoomIn(): void {
    this.zoomLevel += 0.1;
    this.setZoom();
    this.stopAutoSlide();
    this.isZoomed = true;
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.1) {
      this.zoomLevel -= 0.1;
      this.setZoom();
    } else {
    //   this.startAutoSlide();
      this.isZoomed = false;
    }
  }

  setZoom(): void {
    if (!this.carousel) return; // Check if carousel is initialized
    const currentSlide = this.carousel.nativeElement.children[this.slideIndex];
    const imageElement = currentSlide.querySelector('img');
    if (!imageElement) return;
    this.renderer.setStyle(imageElement, 'transform', `scale(${this.zoomLevel})`);
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.isZoomed) return;
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    const imageElement = this.carousel.nativeElement.children[this.slideIndex].querySelector('img');
    if (!imageElement) return;
    const transform = window.getComputedStyle(imageElement).transform;
    const matrix = new DOMMatrix(transform);
    this.translateX = matrix.m41;
    this.translateY = matrix.m42;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;
    const newX = this.translateX + deltaX;
    const newY = this.translateY + deltaY;
    this.setTranslate(newX, newY);
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  setTranslate(x: number, y: number): void {
    const imageElement = this.carousel.nativeElement.children[this.slideIndex].querySelector('img');
    if (!imageElement) return;
    imageElement.style.transform = `translate(${x}px, ${y}px) scale(${this.zoomLevel})`;
  }

}


@Component({
  selector: 'docViewPDF',
  templateUrl: 'docViewPDF.html'
})
export class DialogElementsModalPDF {
  constructor(
    public dialogRef: MatDialogRef<DialogElementsModal>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

    modaldataurl = this.data.uri;
    zoom = .9;
    zoomIn() {
      this.zoom++;
    }

    zoomOut() {
      this.zoom--;
    }

    ngOnInit(): void {
  
      // this.convertTifToPng();
  
    }
}
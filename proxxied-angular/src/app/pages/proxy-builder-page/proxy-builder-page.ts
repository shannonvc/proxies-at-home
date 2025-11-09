import { Component } from '@angular/core';
import { UploadSectionComponent } from '../../components/upload-section/upload-section';
import { PageViewComponent } from '../../components/page-view/page-view';

@Component({
  selector: 'app-proxy-builder-page',
  imports: [UploadSectionComponent, PageViewComponent],
  templateUrl: './proxy-builder-page.html',
  styleUrl: './proxy-builder-page.scss',
})
export class ProxyBuilderPageComponent {

}

import { environment } from '../../environments/environment';
import { PortalCoreModule } from 'portal-core-ui/portal-core.module';
import { KeysPipe } from 'portal-core-ui/uiutilities/pipes';
import { PortalCorePipesModule } from 'portal-core-ui/uiutilities/portal-core.pipes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

import { SolutionsModule } from './solutions/solutions.module';

@NgModule({
  imports: [
    PortalCorePipesModule,
    CommonModule,
    LayoutRoutingModule,
    TranslateModule,
    NgbDropdownModule.forRoot(),
    SolutionsModule
  ],
  declarations: [LayoutComponent, SidebarComponent, HeaderComponent]
})
export class LayoutModule {}

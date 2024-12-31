import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextViewerComponent } from './context-viewer.component';

describe('ContextViewerComponent', () => {
  let component: ContextViewerComponent;
  let fixture: ComponentFixture<ContextViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

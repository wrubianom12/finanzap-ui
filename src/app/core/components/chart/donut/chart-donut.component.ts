import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from '../../../../demo/chart & map/core-apex/core-apex.component';

@Component({
  selector: 'app-char-donut',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule, NgApexchartsModule],
  templateUrl: './chart-donut.component.html',
  styleUrls: ['./chart-donut.component.scss']
})
export default class ChartDonutComponent {

  pipe: boolean = false;
  charPropertes: Partial<ChartOptions>;
  title: string = 'Total transactions';
  totalRows: number = 0;
  items: { label: string; value: number; color: string; }[] = [];

  @Input()
  set itemsChart(itemsChart: any) {


    console.log(`El resultado de items char es ::::: ${JSON.stringify(itemsChart)}`);

    this.charPropertes = this.restoreChart();
    this.items = itemsChart;
    let arraySerials: Array<any> = [];
    this.totalRows = 0;
    if (itemsChart) {
      for (let i = 0; i < itemsChart.length; i++) {
        if (itemsChart[i].label !== '' && itemsChart[i].label !== 'NaN') {
          arraySerials.push(itemsChart[i].value);
          this.totalRows += itemsChart[i].value;
          this.charPropertes.labels?.push(itemsChart[i].label);
          this.charPropertes.colors?.push(this.generateRandomColor());
        }
      }
      this.charPropertes.series = arraySerials;
    }
  }

  @Input()
  set titleCard(titleCard: string) {
    this.title = titleCard;
  }

  @Input()
  set typeMov(tipeMov: string) {

  }

  generateRandomColor(): string {
    const randomColor = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    return `#${randomColor}`;
  }


  constructor() {
    this.charPropertes = this.restoreChart();
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.restoreChart();
  }

  restoreChart(): Partial<ChartOptions> {
    return {
      labels: [],
      series: [],
      colors: [],
      chart: {
        height: 150,
        type: 'donut'
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '10%'
          }
        }
      },
      legend: {
        show: false
      },
      tooltip: {
        theme: 'datk'
      },
      grid: {
        padding: {
          top: 20,
          right: 0,
          bottom: 0,
          left: 0
        }
      },

      fill: {
        opacity: [1, 1]
      },
      stroke: {
        width: 0
      }
    };
  }
}

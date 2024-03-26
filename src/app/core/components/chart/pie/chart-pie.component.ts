import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from '../../../../demo/chart & map/core-apex/core-apex.component';

@Component({
  selector: 'app-char-pie',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule, NgApexchartsModule],
  templateUrl: './chart-pie.component.html',
  styleUrls: ['./chart-pie.component.scss']
})
export default class ChartPieComponent {

  pipe: boolean = false;
  charPropertes: Partial<ChartOptions>;
  title: string = 'Total transactions';
  totalRows: number = 0;
  items: { label: string; value: number; color: string; }[] = [];

  @Input()
  set itemsChart(itemsChart: any) {
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
        height: 500,
        type: 'donut'
      },
      dataLabels: {
        enabled: true,
        dropShadow: {
          enabled: false
        }
      },
      legend: {
        show: true,
        position: 'bottom'
      },
      tooltip: {
        y: {
          // Función personalizada para formatear el valor mostrado en el tooltip
          formatter: function(value) {
            return new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP'
            }).format(value);
          }
        }
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true
              },
              value: {
                show: true
              }
            }
          }
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };
  }

}

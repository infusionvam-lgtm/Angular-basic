import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  HostListener,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { SelectOptionService } from "../../theme/shared/components/select/select-option.service";
import * as Highcharts from "highcharts";
import HC_drilldown from "highcharts/modules/drilldown";
HC_drilldown(Highcharts);
import "rxjs/add/operator/map";
declare const AmCharts: any;
import "../../../assets/charts/amchart/amcharts.js";
import "../../../assets/charts/amchart/gauge.js";
import "../../../assets/charts/amchart/serial.js";
import "../../../assets/charts/amchart/light.js";
import "../../../assets/charts/amchart/pie.min.js";
import "../../../assets/charts/amchart/ammap.min.js";
import "../../../assets/charts/amchart/usaLow.js";
import "../../../assets/charts/amchart/radar.js";
import "../../../assets/charts/amchart/worldLow.js";
import { CxDataStoryService } from "src/app/core/services/cxDataStory.service";
import ApexCharts from "apexcharts";
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { trigger, transition, style, animate } from "@angular/animations";
import * as moment from "moment";
import { AuthService } from "src/app/core/services";
import { Subject, Subscription } from "rxjs";
import { DataTableDirective } from "angular-datatables";
import { NgxSpinnerService } from "ngx-spinner";
import { CustomDateParserFormatter } from "src/app/core/helpers/custom-date.parser";
import { PropertyService } from "src/app/core/services/property.service";
declare let google: any;
declare var $: any;

@Component({
  selector: "app-story-analysis",
  templateUrl: "./story-analysis.component.html",
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
  styleUrls: [
    "./story-analysis.component.scss",
    "../../../../node_modules/famfamfam-flags/dist/sprite/famfamfam-flags.min.css",
    "../../../../node_modules/nvd3/build/nv.d3.css",
  ],
  animations: [
    trigger("toggleFilter", [
      transition(":enter", [
        style({ height: 0, opacity: 0, transform: "scaleY(0.95)" }),
        animate(
          "200ms ease-out",
          style({ height: "*", opacity: 1, transform: "scaleY(1)" })
        ),
      ]),
      transition(":leave", [
        animate(
          "100ms ease-in",
          style({ height: 0, opacity: 0, transform: "scaleY(0.95)" })
        ),
      ]),
    ]),
  ],
})
export class StoryAnalysisComponent implements OnInit {
  private chart!: ApexCharts;
  @ViewChild("chart", { static: true }) chartElement!: ElementRef<HTMLElement>;
  @ViewChildren("cardChart") chartElements!: QueryList<ElementRef<HTMLElement>>;
  private cardCharts: ApexCharts[] = [];
  stackedMultiBarData: any = { series: [], label: [] };
  dailyTrendData: any = { series: [], label: [] };
  yearlyTrendData: any = { series: [], label: [] };
  monthlyTrendData: any = { series: [], label: [] };
  subRegionList: any = [];
  topicList: any = [];
  worldMapData: any = [];
  attributeTableColumn: any = [];
  attributeList: any = [];
  countryList: any = [];
  locationList: any = [];
  departmentList: any = [];
  isFilterOpen: boolean = false;
  russiaHcsCount: any;
  polandHcsCount: any;
  indiaHcsCount: any;
  thailandHcsCount: any;
  philippinesHcsCount: any;
  malaysiaHcsCount: any;
  australiaHcsCount: any;
  newZealandHcsCount: any;
  kenyaHcsCount: any;
  botswanaHcsCount: any;
  southAfricaHcsCount: any;
  mexicoHcsCount: any;
  nicaraguaHcsCount: any;
  toDate: NgbDateStruct | null;
  brazilHcsCount: any;
  fromDate: NgbDateStruct;
  hoveredDate: NgbDate | null = null;
  previousFromDate: NgbDateStruct;
  previousToDate: NgbDateStruct;
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
  isIncludeTodayDate: boolean = false;
  disabledCheckbox: boolean = true;
  trendRange: string = "Daily";
  selectedRange: string;
  barChartData: any;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  //card count
  hcsStaffCount: any = {};
  hcsShoppingCount: any = {};
  hcsParkCount: any = {};
  hcsRoomCount: any = {};
  hcsLocationCount: any = {};
  hcsValueCount: any = {};
  hcsHotelCount: any = {};
  hcsSmelllessCount: any = {};
  data: any = [];
  responseData: any = [];
  tableFilteredData: any = [];
  attributeTableFilteredData: any = [];
  topics: any[] = [];
  PropertyList: any[] = [];
  topicsHCS: any[] = [];
  attributions: any[] = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  CustomDateRange: any;
  public lineBasicChartOptions: any;
  public lineAreaOption: any;
  public barHorizontalChartData: any;
  public barHorizontalChartOption: any;
  public barHorizontalChartTag: CanvasRenderingContext2D;
  public barBasicChartOptions: any;
  public bubbleChartData: any;
  selectedProperty: any = { experienceType: "EX" };
  selectedSource: any;
  selectedPropertyValue: string;
  successMessage;
  errorMessage;
  mapInstance: any;
  p: number = 1;
  subscription: Subscription;
  colorPalette = [
    "#4CAF50", // Forest Green
    "#E91E63", // Bright Pink
    "#2196F3", // Cobalt Blue
    "#FFC107", // Amber
    "#9C27B0", // Deep Purple
    "#FF5722", // Deep Orange
    "#009688", // Turquoise
    "#673AB7", // Indigo
  ];

  selectedTopicValues: any[] = [];
  selectedAttributeValues: any[] = [];
  selectedCountryValues = [];
  selectedLocationValues = [];
  selectedSubRegionValues = [];
  selectedDepartmentValues = [];
  selectedAccountOptions: any[] = [];
  selectedRangeOption: any[] = [];
  resetFilter = false;
  resetTopicFilter = false;
  resetAttributeFilter = false;
  resetCountryFilter = false;
  resetSubRegionFilter = false;
  resetDepartmentFilter = false;
  resetLocationFilter = false;
  selectedSeries: any[] = [];
  selectedSeriesName: string = "";
  seriesNamesOptions: { label: string; value: string }[] = [];
  dropdownSettings = {
    selectAllText: "Consolidate",
  };

  @Output() dateSelect = new EventEmitter<NgbDateStruct>();
  @ViewChild("barHorizontalChart") barHorizontalChart: ElementRef;
  @ViewChild("filterSidebar", { static: true }) filterSidebar!: ElementRef;
  @ViewChild("filterToggle") filterToggle: ElementRef;

  constructor(
    private selectOptionService: SelectOptionService,
    private cxDataStoryService: CxDataStoryService,
    private calendar: NgbCalendar,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    public formatter: NgbDateParserFormatter,
    private propertyService: PropertyService
  ) {}
  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    const clickedSidebar = this.filterSidebar?.nativeElement.contains(
      event.target
    );

    const clickedToggle = this.filterToggle?.nativeElement.contains(
      event.target
    );

    if (!clickedSidebar && !clickedToggle) {
      this.isFilterOpen = false;
    }
  }

  ngOnInit() {
    this.CustomDateRange = this.selectOptionService.getCustomDateRange();
    if (this.CustomDateRange.length > 0) {
      const defaultRage = this.CustomDateRange.filter(
        (range) => range.value === "this_year_date"
      )[0];
      this.selectedRangeOption = [
        { item_id: defaultRage.value, item_text: defaultRage.label },
      ];
    }
    this.loadUserData();
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getNext(this.calendar.getToday(), "d", 10);
  }
  ngAfterViewInit() {
    this.initializeChart();
    // this.renderMap();
    this.chartElements.changes.subscribe(() => {
      this.initializeCardChartData();
      this.initializeCardCharts();
    });
    this.attributeTableColumn = [
      { field: "id", header: "#", width: "20%" },
      { field: "entity", header: "Attribute", width: "20%" },
      { field: "mention", header: "Mentions", width: "20%" },
      { field: "his", header: "Importance", width: "20%" },
      { field: "sentiment", header: "Sentiment", width: "20%" },
      // { field: 'percentage', header: '%', width: '10%' },
    ];
  }
  ngOnDestroy() {
    this.cardCharts.forEach((chart) => chart.destroy());
    this.cardCharts = [];
  }

  initializeCardChartData() {
    this.topicsHCS.forEach((item) => {
      // Determine the min and max for the y-axis based on hcsData
      const dataValues = item.hcsData.data;
      const minValue = Math.min(...dataValues);
      const maxValue = Math.max(...dataValues);
      const padding = 1; // Add some padding to the y-axis range
      const yAxisMin = Math.floor(minValue - padding);
      const yAxisMax = Math.ceil(maxValue + padding);

      item.chartOptions = {
        series: [
          {
            name: "HCS Trend",
            data: item.hcsData.data,
          },
        ],
        chart: {
          height: 100,
          width: "100%",
          type: "area",
          toolbar: { show: false },
          zoom: { enabled: false },
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
          },
          background: "transparent",
          dropShadow: {
            enabled: true,
            top: 0,
            left: 0,
            blur: 2,
            opacity: 0.1,
            color: "#1de7ba", // mint green (same as your image)
          },
        },
        stroke: {
          width: 2,
          curve: "smooth",
          colors: ["#1de9b6"], // line color from image
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.2,
            opacityTo: 0.05,
            stops: [0, 90, 100],
            colorStops: [
              {
                offset: 0,
                color: "#1de9b6",
                opacity: 0.2,
              },
              {
                offset: 100,
                color: "#1de9b6",
                opacity: 0.03,
              },
            ],
          },
        },
        colors: ["#1de9b6"],
        xaxis: {
          categories: item.hcsData.creationTime,
          labels: { show: false },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          min: yAxisMin,
          max: yAxisMax,
          labels: { show: false },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        dataLabels: { enabled: false },
        grid: { show: false },
        tooltip: {
          enabled: true,
          theme: "dark",
          style: {
            fontSize: "12px",
            fontFamily: "Arial, sans-serif",
            colors: ["#FFFFFF"],
          },
          x: { show: false },
        },
        markers: {
          size: 0,
        },
      };
    });
  }

  initializeCardCharts() {
    this.cardCharts.forEach((chart) => chart.destroy());
    this.cardCharts = [];

    this.chartElements.forEach((chartElement, index) => {
      const chartData = this.topicsHCS[index];
      if (chartElement && chartElement.nativeElement) {
        const chart = new ApexCharts(
          chartElement.nativeElement,
          chartData.chartOptions
        );
        chart.render();
        this.cardCharts.push(chart);
      }
    });
  }
  getDateRangeDisplay(): string {
    const from = this.fromDate ? this.formatter.format(this.fromDate) : "";
    const to = this.toDate ? this.formatter.format(this.toDate) : "";

    if (!from && !to) {
      return "Enter date range";
    }

    return `${from} - ${to}`;
  }

  onDateSelection(date: NgbDate) {
    // Check if the date is actually being selected again
    if (
      this.fromDate &&
      date.year === this.fromDate.year &&
      date.month === this.fromDate.month &&
      date.day === this.fromDate.day &&
      !this.toDate
    ) {
      return; // User clicked the same date — ignore
    }

    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate) {
      this.toDate = date;

      // Swap if fromDate is after toDate
      const from = new Date(
        this.fromDate.year,
        this.fromDate.month - 1,
        this.fromDate.day
      );
      const to = new Date(
        this.toDate.year,
        this.toDate.month - 1,
        this.toDate.day
      );

      if (from > to) {
        const temp = this.fromDate;
        this.fromDate = this.toDate;
        this.toDate = temp;
      }
    } else {
      // Reset selection
      this.fromDate = date;
      this.toDate = null;
    }
  }

  applyDateRange() {
    if (this.fromDate && this.toDate) {
      const fromJsDate = new Date(
        this.fromDate.year,
        this.fromDate.month - 1,
        this.fromDate.day
      );
      const toJsDate = new Date(
        this.toDate.year,
        this.toDate.month - 1,
        this.toDate.day
      );

      this.from = fromJsDate.toString();
      this.to = toJsDate.toString();

      this.showSpinner("sp5");
      this.asyncFilterData();
      this.selectedRangeOption = [{ item_id: "fixed", item_text: "Fixed" }];
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(
    currentValue: NgbDate | NgbDateStruct | null,
    input: string
  ): NgbDate | null {
    const parsed = this.formatter.parse(input);

    // if (parsed && this.calendar.isValid(parsed)) {
    //   // If parsed is already an NgbDate, return as is
    //   return parsed instanceof NgbDate ? parsed : NgbDate.from(parsed);
    // }

    if (currentValue) {
      return currentValue instanceof NgbDate
        ? currentValue
        : NgbDate.from(currentValue);
    }

    return null;
  }

  async loadUserData() {
    this.showSpinner("sp5");
    this.PropertyList = JSON.parse(this.authService.getProperties());
    if (this.PropertyList && this.PropertyList?.length > 0) {
      this.PropertyList.sort((a, b) => {
        const nameA = a?.propertyName?.toLowerCase() || "";
        const nameB = b?.propertyName?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });
    }
    this.setSelectedProperty(undefined, true);
  }

  destroyMap() {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  }

  renderMap() {
    this.destroyMap();

    const markers = this.worldMapData.map((data) => ({
      latLng: [data.lat, data.lon],
      name: data.name,
      style: { fill: data.color, stroke: "#fff", "stroke-width": 1, r: 8 },
      value: data.value,
    }));

    this.mapInstance = $("#world-map")
      .vectorMap({
        map: "world_mill_en",
        backgroundColor: "#f5f5f5",
        regionStyle: {
          initial: {
            fill: "#d3d3d3",
            "fill-opacity": 1,
            stroke: "none",
            "stroke-width": 0,
            "stroke-opacity": 1,
          },
        },
        markers: markers,
        onMarkerLabelShow: (event: any, label: any, index: any) => {
          const marker = markers[index];
          label.html(`${marker.name}: ${marker.value}`);
        },
      })
      .vectorMap("get", "mapObject");
  }

  onRangeChanged(selectedRange: string) {
    this.trendRange = selectedRange;

    if (selectedRange === "Daily") {
      this.stackedMultiBarData = this.dailyTrendData;
    } else if (selectedRange === "Yearly") {
      this.stackedMultiBarData = this.yearlyTrendData;
    } else {
      this.stackedMultiBarData = this.monthlyTrendData;
    }
    // this.seriesNamesOptions = this.stackedMultiBarData.map(s => ({
    //   label: s.name,
    //   value: s.name
    // }));

    // Preselect first item
    // if (!this.selectedSeriesName) {
    //   this.selectedSeriesName = this.seriesNamesOptions[0].value;
    // }
    // if (this.seriesNamesOptions.length) {
    //   this.selectedSeries = [{ item_id: this.selectedSeriesName, item_text: this.selectedSeriesName }];

    // }
    this.updateChartData();
  }
  // onSeriesChange(selected: string[]): void {
  //   if (selected && selected.length) {
  //     this.selectedSeriesName = selected[0];
  //     this.updateChartData();
  //   }
  // }
  // const hcsData = this.stackedMultiBarData.series.find(s => s.name === this.selectedSeriesName)?.data || [];
  // .find(s => s.name === this.selectedSeriesName)
  updateChartData() {
    const chartData = this.stackedMultiBarData;

    const columnWidth = 60;
    const visibleColumns = 12;

    const fullWidth =
      chartData.label.length > visibleColumns
        ? chartData.label.length * columnWidth
        : "100%";

    const allDataPoints = chartData.series.flatMap((s) => s.data);
    const yMin = Math.floor(Math.min(...allDataPoints)) - 1;
    const yMax = Math.ceil(Math.max(...allDataPoints)) + 1;

    if (this.chart) {
      this.chart.updateOptions({
        series: chartData.series,
        chart: {
          width: fullWidth,
        },
        xaxis: {
          categories: chartData.label,
        },
        yaxis: {
          min: yMin,
          max: yMax,
          labels: {
            formatter: (value) => value.toFixed(1),
          },
        },
      });
    }
  }

  initializeChart() {
    const options = {
      series: this.stackedMultiBarData.series,
      chart: {
        height: 390,
        width: "100%",
        type: "bar",
        stacked: true,
        toolbar: { show: false },
        zoom: {
          enabled: true,
          type: "x",
          autoScaleYaxis: false,
        },
        scrollbar: {
          enabled: true,
          height: 6,
          background: "#e0e0e0",
          thumb: { background: "#666" },
        },
        background: "transparent",
      },
      xaxis: {
        categories: this.stackedMultiBarData.label,
        labels: {
          rotate: -45,
          trim: false,
          hideOverlappingLabels: false,
          style: {
            fontSize: "12px",
            fontFamily: "Arial, sans-serif",
            colors: "#666",
          },
        },
        axisBorder: { show: true, color: "#ddd" },
        axisTicks: { show: true, color: "#ddd" },
      },
      yaxis: {
        min: -5,
        max: 5,
        labels: {
          formatter: function (value: number) {
            return Math.round(value);
          },
          style: {
            fontSize: "12px",
            fontFamily: "Arial, sans-serif",
            colors: "#666",
          },
        },
      },
      legend: {
        position: "bottom",
        fontSize: "14px",
        fontFamily: "Arial, sans-serif",
        labels: { colors: "#333" },
        markers: {
          width: 12,
          height: 12,
          radius: 2,
        },
      },
      stroke: {
        width: [0, 0, 2],
        curve: "straight",
      },
      dataLabels: { enabled: false },
      grid: {},
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 2,
          columnWidth: "20px",
        },
      },
    };
    this.chart = new ApexCharts(this.chartElement.nativeElement, options);
    this.chart.render();
  }

  onSeriesToggle(event: any): void {
    const selected = event.target.value;

    if (!this.chart) return;

    if (!selected) {
      // Show all series
      this.stackedMultiBarData.series.forEach((s) => {
        this.chart.showSeries(s.name);
      });
    } else {
      // Hide all, then show selected
      this.stackedMultiBarData.series.forEach((s) => {
        if (s.name === selected) {
          this.chart.showSeries(s.name);
        } else {
          this.chart.hideSeries(s.name);
        }
      });
    }
  }

  setSelectedProperty(
    selectedValue: string | string[],
    refreshFilter: boolean
  ) {
    if (!selectedValue) {
      this.selectedAccountOptions = [
        {
          item_id: this.PropertyList[0].value,
          item_text: this.PropertyList[0].label,
        },
      ];
    }
    if (selectedValue == "consolidate") {
      this.ChangePropertyType(selectedValue);
    } else {
      if (this.PropertyList.length > 0) {
        selectedValue =
          Array.isArray(selectedValue) && selectedValue.length > 0
            ? selectedValue
            : [];
        // const propertyValue = selectedValue[1];
        const property = this.PropertyList.find(
          (p) => p.value
        );
        const properties = (selectedValue as string[]).join(",");
        this.selectedProperty = { ...property };
        this.selectedPropertyValue = this.selectedProperty.value;
        this.selectedProperty.experienceType =
          Array.isArray(selectedValue) && selectedValue.length > 0
            ? "CX"
            : "EX";

        const data = { properties };
        this.loadMultipleData(data, refreshFilter);
      } else {
        this.hideSpinner("sp5");
      }
    }
  }






  openFilterModal() {
    this.isFilterOpen = !this.isFilterOpen;
  }
  async loadMultipleData(data: any, refreshFilter: boolean) {
    if (!data.properties) {
      this.data = [];
      this.loadData([], refreshFilter);
    } else {
      this.subscription = this.cxDataStoryService
        // .getMultipleEntityData(data) // Before parent child properties
        .getMultipleEntityParentChildData(data)
        .subscribe(
          (response) => {
            this.subscription.unsubscribe();
            if (response.length > 0) {
              this.data = response;
              this.loadData(response, refreshFilter);
            } else {
              this.resetFilters();
              this.asyncFilterData();
            }
          },
          (error: any) => {
            this.subscription.unsubscribe();
            this.hideSpinner("sp5");
            this.errorMessage = error.message
              ? error.message
              : "Internal Server Error ! Please Try Again";
          }
        );
    }
  }

  loadData(data, refreshFilter) {
    if (this.selectedProperty.propertyName === "consolidate") {

      this.topics = JSON.parse(this.authService.getTotalTopicData() || "[]");
      this.attributions = JSON.parse(this.authService.getTotalTopicAttribution() || "[]");

    } else {
      
      let allTopics: any[] = [];
      let allAttributions: any[] = [];

      const selectedList =Array.isArray(this.selectedProperty)
      ? this.selectedProperty
      : [this.selectedProperty];
      console.log('selectedList: ', selectedList);

    //  Loop through each selected property
      selectedList.forEach(() => {
        const topicData = JSON.parse(this.authService.getTotalTopicData() || "[]") || [];
        const attrData = JSON.parse(this.authService.getTotalTopicAttribution() || "[]") || [];

        //  Push all (allowing duplicates)
        allTopics.push(...topicData);
        allAttributions.push(...attrData);
      });

      // Assign directly without removing duplicates
      this.topics = allTopics;
      this.attributions = allAttributions;
      console.log('this.attributions: ', this.attributions);

    }
    this.getTopicsOptions(this.topics);
    this.getAttributeOptions(this.attributions);
    this.getFilterOptions(data);
    if (refreshFilter) {
      this.ChangeDateRangeType(this.selectedRange);
    }
    this.asyncFilterData();
  }

  ChangePropertyType(value) {
    this.showSpinner("sp5");
    this.resetFilters();
    const data = {
      properties: "",
    };
    if (value === "consolidate") {
      const uuids = this.PropertyList.map((prop) => prop.value);
      data.properties = uuids.toString();
      this.selectedProperty.experienceType = "CX";
      this.selectedProperty.propertyName = "consolidate";
      this.loadMultipleData(data, false);
    } else {
      if (this.selectedSource === "MX") {
        this.selectedSource = "";
      }
      this.setSelectedProperty(value, false);
    }
  }

  resetFilters() {
    if (this.selectedTopicValues.length > 0) {
      this.selectedTopicValues = [];
      this.resetTopicFilter = true;
    }
    if (this.selectedAttributeValues) {
      this.selectedAttributeValues = [];
      this.resetAttributeFilter = true;
    }
    this.selectedRangeOption = [
      { item_id: "auto_range", item_text: "Auto Range" },
    ];
    if (this.selectedCountryValues) {
      this.selectedCountryValues = [];
      this.resetCountryFilter = true;
    }
    if (this.selectedLocationValues) {
      this.resetLocationFilter = true;
      this.selectedLocationValues = [];
    }
    if (this.selectedSubRegionValues) {
      this.resetSubRegionFilter = true;
      this.selectedSubRegionValues = [];
    }
    if (this.selectedDepartmentValues) {
      this.resetDepartmentFilter = true;
      this.selectedDepartmentValues = [];
    }
    this.selectedRange = "auto_range";
    this.disabledCheckbox = true;
    this.isIncludeTodayDate = false;
    this.ChangeDateRangeType(this.selectedRange);
    this.resetFilter = true;
  }

  getFilterOptions(response) {
    this.getSubRegionOptions(response);
    this.getLocationOptions(response);
    this.getCountryOptions(response);
    this.getDepartmentOptions(response);
  }

  getDepartmentOptions(data) {
    let departmentList = [];
    data.map((review) => {
      if (review.department != null) {
        departmentList.push(review.department);
      }
    });
    departmentList = this.removeDuplicateValues(departmentList);
    this.departmentList = this.createOptions(departmentList);
  }

  getSubRegionOptions(data) {
    let subRegionList = data.map((review) => review.subContinent);
    subRegionList = this.removeDuplicateValues(subRegionList);
    this.subRegionList = this.createOptions(subRegionList);
  }

  getTopicsOptions(topics) {
    this.topicList = [];
    if (topics) {
      topics.sort(function (a, b) {
        return a.localeCompare(b);
      });
      this.topicList = this.createOptions(topics);
    }
  }

  getAttributeOptions(topics) {
    (topics ?? []).sort(function (a, b) {
      return a.localeCompare(b);
    });
    this.attributeList = this.createOptions(topics);
  }

  getLocationOptions(data) {
    let locationList = data.map((review) => review.location);
    locationList = this.removeDuplicateValues(locationList);
    this.locationList = this.createOptions(locationList);
  }

  getCountryOptions(data) {
    let countryList = data.map((review) => review.country);
    countryList = this.removeDuplicateValues(countryList);
    this.countryList = this.createOptions(countryList);
  }

  removeDuplicateValues(data) {
    let dataSet = new Set(data);
    return [...dataSet];
  }

  createOptions(data) {
    if ((data ?? []).length > 0) {
      data.sort(function (a, b) {
        return a.localeCompare(b);
      });
      return data.map((data) => {
        return { value: data, label: data };
      });
    } else {
      return [];
    }
  }

  // updateAttributeListByTopic(values: string[]) {
  //   let combinedAttributions = [];
  //   values.forEach((value) => {
  //     const attributionData = this.authService.getAttributionData(
  //       this.selectedProperty.label + value
  //     );
  //     try {
  //       const parsedData = JSON.parse(attributionData);
  //       if (Array.isArray(parsedData)) {
  //         combinedAttributions = combinedAttributions.concat(parsedData);
  //       }
  //     } catch (e) {
  //       console.error(
  //         `Failed to parse attribution data for value: ${value}`,
  //         e
  //       );
  //     }
  //   });

  //   // Remove duplicates if needed
  //   this.attributions = Array.from(new Set(combinedAttributions));
  //   this.getAttributeOptions(this.attributions);
  // }

  updateAttributeListByTopic(values: string[]): void {
  let combinedAttributions: any[] = [];
  // Loop through all selected topics
  values.forEach((value) => {
    // For each property in PropertyList
    this.PropertyList.forEach((property) => {
      console.log('property: ', property);
      try {
        const rawData = this.authService.getAttributionData(property.label + value);
        console.log('rawData: ', rawData);
        const parsedData = JSON.parse(rawData);

        if (Array.isArray(parsedData)) {
          combinedAttributions = combinedAttributions.concat(parsedData);
        }
      } catch (e) {
        console.error(
          `Failed to parse attribution data for property: ${property.label}, topic: ${value}`,
          e
        );
      }
    });
  });
  // Remove duplicates (assuming string array)
  this.attributions = Array.from(new Set(combinedAttributions));
  console.log('this.attributions: ', this.attributions);
  // Update UI options
  this.getAttributeOptions(this.attributions);
}

  loadAllTopicsAndAttributes() {
    // Load all topics and attributes from AuthService
    this.topics = JSON.parse(this.authService.getTotalTopicData());
    this.attributions = JSON.parse(this.authService.getTotalTopicAttribution());

    // Update topic and attribute options
    this.getTopicsOptions(this.topics);
    this.getAttributeOptions(this.attributions);
  }

  onAccountSelectionChange(selectedItems: string[]): void {
    this.showSpinner("sp5");
    this.setSelectedProperty(selectedItems, false);
    this.resetFilter = false;
  }

  onTopicSelectionChange(selectedItems: string[]): void {
    this.showSpinner("sp5");
    this.selectedTopicValues = [...selectedItems];
    this.resetTopicFilter = false;
    // If no specific topic is selected, load all topics and attribute
    selectedItems.length > 0
      ? this.updateAttributeListByTopic(this.selectedTopicValues)
      : this.loadAllTopicsAndAttributes();
    this.asyncFilterData();
  }

  asyncFilterData() {
    const timeout = setTimeout(() => {
      this.filterData();
      clearTimeout(timeout);
    }, 100);
  }

  onCountrySelectionChange(selectedItems: string[]): void {
    this.showSpinner("sp5");
    this.selectedCountryValues = [...selectedItems];
    this.resetCountryFilter = false;
    this.asyncFilterData();
  }

  onLocationSelectionChange(selectedItems: string[]): void {
    this.showSpinner("sp5");
    this.selectedLocationValues = [...selectedItems];
    this.asyncFilterData();
    this.resetLocationFilter = false;
  }

  onDepartmentSelectionChange(selectedItems: string[]): void {
    this.showSpinner("sp5");
    this.selectedDepartmentValues = [...selectedItems];
    this.resetDepartmentFilter = false;
    this.asyncFilterData();
  }

  onSubRegionSelectionChange(selectedItems: string[]): void {
    this.showSpinner("sp5");
    this.selectedSubRegionValues = [...selectedItems];
    this.resetSubRegionFilter = false;
    this.asyncFilterData();
  }

  onAttributeSelectionChange(selectedItems: string[]): void {
    console.log('selectedItems: ', selectedItems);
    this.showSpinner("sp5");
    this.selectedAttributeValues = [...selectedItems];
    console.log('this.selectedAttributeValues: ', this.selectedAttributeValues);
    this.resetAttributeFilter = false;
    this.asyncFilterData();
  }

  OnIncludeTodayChange() {
    this.showSpinner("sp5");
    this.ChangeDateRangeType(this.selectedRange);
    this.asyncFilterData();
  }

  // onSearch(query: string = "") {
  //   if (query != "") {
  //     const items = this.tableFilteredData.filter(
  //       (topic) => topic.entity.toLowerCase().indexOf(query.toLowerCase()) != -1
  //     );
  //     this.attributeTableFilteredData = items;
  //   } else {
  //     this.attributeTableFilteredData = this.tableFilteredData;
  //   }
  // }

  onDateSelect($event) {
    this.showSpinner("sp5");
    this.selectedRange = "fixed";
    this.disabledCheckbox = true;
    let fromDate = this.fromDate
      ? new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day)
      : new Date();
    let toDate = this.toDate
      ? new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day)
      : new Date();
    if (fromDate > toDate) {
      fromDate = new Date();
      toDate = new Date();
    }
    const diff = moment(toDate).diff(moment(fromDate), "days") + 1;
    const prevFromDate = new Date(
      moment(fromDate).subtract(diff, "days").format("YYYY/MM/DD")
    );
    const prevToDate = new Date(
      moment(toDate).subtract(diff, "days").format("YYYY/MM/DD")
    );
    this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    // this.asyncFilterData();
  }

  onEndDateSelect($event) {
    this.showSpinner("sp5");
    let fromDate = this.fromDate
      ? new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day)
      : new Date();
    let toDate = new Date(
      this.toDate.year,
      this.toDate.month - 1,
      this.toDate.day
    );
    if (fromDate > toDate) {
      fromDate = new Date();
      toDate = new Date();
    }
    const diff = moment(toDate).diff(moment(fromDate), "days") + 1;
    const prevFromDate = new Date(
      moment(fromDate).subtract(diff, "days").format("YYYY/MM/DD")
    );
    const prevToDate = new Date(
      moment(toDate).subtract(diff, "days").format("YYYY/MM/DD")
    );
    this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    this.asyncFilterData();
  }

  onDateRangeSelect(type: string) {
    this.showSpinner("sp5");
    this.ChangeDateRangeType(type);
    this.asyncFilterData();
  }

  ChangeDateRangeType(type: string) {
    this.selectedRange = type;
    if (type == "today") {
      this.disabledCheckbox = true;
      const fromDate = new Date(moment().format("YYYY/MM/DD"));
      const toDate = new Date(moment().format("YYYY/MM/DD"));
      const prevFromDate = new Date(
        moment(fromDate).subtract(1, "days").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(toDate).subtract(1, "days").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "yesterday") {
      this.disabledCheckbox = true;
      const fromDate = new Date(
        moment().subtract(1, "days").format("YYYY/MM/DD")
      );
      const toDate = new Date(
        moment().subtract(1, "days").format("YYYY/MM/DD")
      );
      const prevFromDate = new Date(
        moment(fromDate).subtract(1, "days").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(toDate).subtract(1, "days").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "fixed") {
      this.disabledCheckbox = true;

      const fromDate = this.from ?? new Date(moment().format("YYYY/MM/DD"));
      const toDate = this.to ?? new Date(moment().format("YYYY/MM/DD"));

      const dateDiffInDays = moment(toDate).diff(moment(fromDate), "days");
      const prevFromDate = new Date(
        moment(fromDate).subtract(dateDiffInDays, "days").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(toDate).subtract(dateDiffInDays, "days").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "last_14_days") {
      this.disabledCheckbox = false;
      const fromDateDiff = this.isIncludeTodayDate ? 13 : 14;
      const fromDate = new Date(
        moment().subtract(fromDateDiff, "days").format("YYYY/MM/DD")
      );
      const toDate = this.isIncludeTodayDate
        ? moment().format("YYYY/MM/DD")
        : moment().subtract(1, "days").format("YYYY/MM/DD");

      const prevFromDateDiff = 14;
      const prevFromDate = new Date(
        moment(fromDate).subtract(prevFromDateDiff, "days").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(toDate).subtract(prevFromDateDiff, "days").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "last_28_days") {
      this.disabledCheckbox = false;
      const fromDateDiff = this.isIncludeTodayDate ? 27 : 28;
      const fromDate = new Date(
        moment().subtract(fromDateDiff, "days").format("YYYY/MM/DD")
      );
      const toDate = this.isIncludeTodayDate
        ? moment().format("YYYY/MM/DD")
        : moment().subtract(1, "days").format("YYYY/MM/DD");
      const prevFromDateDiff = 28;
      const prevFromDate = new Date(
        moment(fromDate).subtract(prevFromDateDiff, "days").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(toDate).subtract(prevFromDateDiff, "days").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "last_30_days") {
      this.disabledCheckbox = false;
      const fromDateDiff = this.isIncludeTodayDate ? 29 : 30;
      const fromDate = new Date(
        moment().subtract(fromDateDiff, "days").format("YYYY/MM/DD")
      );
      const toDate = this.isIncludeTodayDate
        ? moment().format("YYYY/MM/DD")
        : moment().subtract(1, "days").format("YYYY/MM/DD");
      const prevFromDateDiff = 30;
      const prevFromDate = new Date(
        moment(fromDate).subtract(prevFromDateDiff, "days").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(toDate).subtract(prevFromDateDiff, "days").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "this_week_sun") {
      this.disabledCheckbox = true;
      const fromDate = new Date(moment().startOf("week").format("YYYY/MM/DD"));
      const toDate = new Date(moment().endOf("week").format("YYYY/MM/DD"));
      const prevFromDate = new Date(
        moment().subtract(1, "weeks").startOf("week").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment().subtract(1, "weeks").endOf("week").format("YYYY/MM/DD")
      );
      this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    } else if (type == "this_week_date_sun") {
      this.disabledCheckbox = false;
      const fromDate = new Date(moment().startOf("week").format("YYYY/MM/DD"));
      const toDate = this.isIncludeTodayDate
        ? moment().format("YYYY/MM/DD")
        : moment().subtract(1, "days").format("YYYY/MM/DD");
      const prevFromDate = new Date(
        moment().subtract(1, "weeks").startOf("week").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(toDate).subtract(1, "weeks").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "last_week_sun") {
      this.disabledCheckbox = true;
      const fromDate = new Date(
        moment().subtract(1, "weeks").startOf("week").format("YYYY/MM/DD")
      );
      const toDate = new Date(
        moment().subtract(1, "weeks").endOf("week").format("YYYY/MM/DD")
      );
      const prevFromDate = new Date(
        moment().subtract(2, "weeks").startOf("week").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment().subtract(2, "weeks").endOf("week").format("YYYY/MM/DD")
      );
      this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    } else if (type == "this_week_mon") {
      this.disabledCheckbox = true;
      const fromDate = new Date(
        moment().startOf("isoWeek").format("YYYY/MM/DD")
      );
      const toDate = new Date(moment().endOf("isoWeek").format("YYYY/MM/DD"));
      const prevFromDate = new Date(
        moment().subtract(1, "weeks").startOf("isoWeek").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment().subtract(1, "weeks").endOf("isoWeek").format("YYYY/MM/DD")
      );
      this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    } else if (type == "this_week_date_mon") {
      this.disabledCheckbox = false;
      const fromDate = new Date(
        moment().startOf("isoWeek").format("YYYY/MM/DD")
      );
      const toDate = this.isIncludeTodayDate
        ? moment().format("YYYY/MM/DD")
        : moment().subtract(1, "days").format("YYYY/MM/DD");
      const prevFromDate = new Date(
        moment().subtract(1, "weeks").startOf("isoWeek").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(toDate).subtract(1, "weeks").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "last_week_mon") {
      this.disabledCheckbox = true;
      const fromDate = new Date(
        moment().subtract(1, "weeks").startOf("isoWeek").format("YYYY/MM/DD")
      );
      const toDate = new Date(
        moment().subtract(1, "weeks").endOf("isoWeek").format("YYYY/MM/DD")
      );
      const prevFromDate = new Date(
        moment().subtract(2, "weeks").startOf("isoWeek").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment().subtract(2, "weeks").endOf("isoWeek").format("YYYY/MM/DD")
      );
      this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    } else if (type == "this_month") {
      this.disabledCheckbox = true;
      const fromDate = new Date(moment().startOf("month").format("YYYY/MM/DD"));
      const toDate = new Date(moment().endOf("month").format("YYYY/MM/DD"));
      const prevFromDate = new Date(
        moment().subtract(1, "months").startOf("month").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment().subtract(1, "months").endOf("month").format("YYYY/MM/DD")
      );
      this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    } else if (type == "this_month_date") {
      this.disabledCheckbox = false;
      const fromDate = new Date(moment().startOf("month").format("YYYY/MM/DD"));
      const toDate = this.isIncludeTodayDate
        ? moment().format("YYYY/MM/DD")
        : moment().subtract(1, "days").format("YYYY/MM/DD");
      const prevFromDate = new Date(
        moment().subtract(1, "months").startOf("month").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(moment(toDate)).subtract(1, "months").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "last_month") {
      this.disabledCheckbox = true;
      const fromDate = new Date(
        moment().subtract(1, "months").startOf("month").format("YYYY/MM/DD")
      );
      const toDate = new Date(
        moment().subtract(1, "months").endOf("month").format("YYYY/MM/DD")
      );
      const prevFromDate = new Date(
        moment().subtract(2, "months").startOf("month").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment().subtract(2, "months").endOf("month").format("YYYY/MM/DD")
      );
      this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    } else if (type == "this_quarter") {
      this.disabledCheckbox = true;
      const fromDate = new Date(
        moment()
          .quarter(moment().quarter())
          .startOf("quarter")
          .format("YYYY/MM/DD")
      );
      const toDate = new Date(
        moment()
          .quarter(moment().quarter())
          .endOf("quarter")
          .format("YYYY/MM/DD")
      );
      const prevFromDate = new Date(
        moment().subtract(1, "quarter").startOf("quarter").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment().subtract(1, "quarter").endOf("quarter").format("YYYY/MM/DD")
      );
      this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    } else if (type == "this_quarter_date") {
      this.disabledCheckbox = false;
      const fromDate = new Date(
        moment()
          .quarter(moment().quarter())
          .startOf("quarter")
          .format("YYYY/MM/DD")
      );
      const toDate = this.isIncludeTodayDate
        ? moment().format("YYYY/MM/DD")
        : moment().subtract(1, "days").format("YYYY/MM/DD");
      const prevFromDate = new Date(
        moment().subtract(1, "quarter").startOf("quarter").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(moment(toDate)).subtract(1, "quarter").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "last_quarter") {
      this.disabledCheckbox = true;
      const fromDate = new Date(
        moment().subtract(1, "quarter").startOf("quarter").format("YYYY/MM/DD")
      );
      const toDate = new Date(
        moment().subtract(1, "quarter").endOf("quarter").format("YYYY/MM/DD")
      );
      const prevFromDate = new Date(
        moment().subtract(2, "quarter").startOf("quarter").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment().subtract(2, "quarter").endOf("quarter").format("YYYY/MM/DD")
      );
      this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    } else if (type == "this_year") {
      this.disabledCheckbox = true;
      const fromDate = new Date(moment().startOf("year").format("YYYY/MM/DD"));
      const toDate = new Date(moment().endOf("year").format("YYYY/MM/DD"));
      const prevFromDate = new Date(
        moment().subtract(1, "year").startOf("year").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment().subtract(1, "year").endOf("year").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "this_year_date") {
      this.disabledCheckbox = false;
      const fromDate = new Date(moment().startOf("year").format("YYYY/MM/DD"));
      const toDate = this.isIncludeTodayDate
        ? moment().format("YYYY/MM/DD")
        : moment().subtract(1, "days").format("YYYY/MM/DD");
      const prevFromDate = new Date(
        moment().subtract(1, "year").startOf("year").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment(moment(toDate)).subtract(1, "year").format("YYYY/MM/DD")
      );
      this.formatDateRange(
        fromDate,
        new Date(toDate),
        prevFromDate,
        prevToDate
      );
    } else if (type == "last_year") {
      this.disabledCheckbox = true;
      const fromDate = new Date(
        moment().subtract(1, "year").startOf("year").format("YYYY/MM/DD")
      );
      const toDate = new Date(
        moment().subtract(1, "year").endOf("year").format("YYYY/MM/DD")
      );
      const prevFromDate = new Date(
        moment().subtract(2, "year").startOf("year").format("YYYY/MM/DD")
      );
      const prevToDate = new Date(
        moment().subtract(2, "year").endOf("year").format("YYYY/MM/DD")
      );
      this.formatDateRange(fromDate, toDate, prevFromDate, prevToDate);
    } else if (type == "auto_range") {
      this.disabledCheckbox = true;
      this.formatDateRange(null, null, null, null);
    }
    this.showSpinner("sp5");
    this.asyncFilterData();
  }

  formatDateRange(fromDate, toDate, prevFromDate, prevToDate) {
    this.from = fromDate;
    this.to = toDate;
    this.prevFrom = prevFromDate;
    this.prevTo = prevToDate;
    if (
      fromDate != null &&
      toDate != null &&
      prevFromDate != null &&
      prevToDate != null
    ) {
      this.fromDate = new NgbDate(
        fromDate.getFullYear(),
        fromDate.getMonth() + 1,
        fromDate.getDate()
      );
      this.toDate = new NgbDate(
        toDate.getFullYear(),
        toDate.getMonth() + 1,
        toDate.getDate()
      );

      this.previousFromDate = new NgbDate(
        prevFromDate.getFullYear(),
        prevFromDate.getMonth() + 1,
        prevFromDate.getDate()
      );
      this.previousToDate = new NgbDate(
        prevToDate.getFullYear(),
        prevToDate.getMonth() + 1,
        prevToDate.getDate()
      );
    } else {
      this.fromDate = null;
      this.toDate = null;
    }
  }

  filterData() {
    let entityData = this.data;
    let data = entityData;
    let previousData = null;

    // Helper to set time to end of day
    const setEndOfDay = (date) => {
      const d = new Date(date);
      d.setHours(23, 59, 59, 999);
      return d;
    };

    // Date range filtering
    if (this.from != null && this.to != null) {
      const fromDate = new Date(this.from);
      const toDate = setEndOfDay(this.to);
      const currentRangeInMs = toDate.getTime() - fromDate.getTime();
      const previousToDate = new Date(fromDate.getTime() - 1);
      const previousFromDate = new Date(
        previousToDate.getTime() - currentRangeInMs
      );

      const inRange = (date, start, end) => date > start && date < end;

      data = entityData.filter((review) =>
        inRange(new Date(review.creationTime), fromDate, toDate)
      );

      previousData = entityData.filter((review) =>
        inRange(new Date(review.creationTime), previousFromDate, previousToDate)
      );
    }

    // Generic filter helper
    const applyFilters = (dataset) => {
      if (!dataset) return null;

      // Apply topic filter
      if (this.selectedTopicValues?.length > 0) {
        dataset = dataset.filter((review) =>
          this.attributions.includes(review.entityWord)
        );
      }

      // Apply shared filters
      const filters = [
        { values: this.selectedCountryValues, key: "country" },
        { values: this.selectedLocationValues, key: "location" },
        { values: this.selectedDepartmentValues, key: "department" },
        { values: this.selectedSubRegionValues, key: "subContinent" },
        { values: this.selectedAttributeValues, key: "entityWord" },
      ];

      for (const { values, key } of filters) {
        if (values?.length > 0) {
          dataset = dataset.filter((review) => values.includes(review[key]));
        }
      }

      return dataset;
    };

    data = applyFilters(data);
    previousData = applyFilters(previousData);

    this.reCalculateData(data, previousData);
    this.getFilterOptions(data);
  }

  reCalculateData(data, previousData) {
    this.calculateCardCount(data, previousData);
    this.calculateTrends(data);
    this.calculateSourceTrendData(data);
    this.getTopicImportanceCount(data);
    // this.calculateMapData(data);
    this.getTopicMonthCount(data);
    this.calculateYearlyTrendData(data);
    this.calculateAttributeDate(data, previousData);
    this.onRangeChanged(this.trendRange);
    const timeout = setTimeout(() => {
      this.hideSpinner("sp5");
      clearTimeout(timeout);
    }, 1000);
  }

  calculateYearlyTrendData(response) {
    // const ecsCounts: any = [];

    // this.topics.map((topic, index) => {
    //   ecsCounts.push(this.getYearlyTopicPerReview(response, topic));
    // });
    this.yearlyTrendData = this.getYearlyTopicPerReview(response);
  }

  calculateCardCount(response, previousData) {
    this.topicsHCS = [];
    (this.topics ?? []).map((topic) => {
      const topicHCS = this.getHCSCountPerReview(response, previousData, topic);
      if (topicHCS.hcs !== 0) {
        this.topicsHCS.push(topicHCS);
      }
    });
  }

  getTopicAttributions(propertyName, topic) {
    let attributions = [];
    if (propertyName !== "consolidate") {
      this.PropertyList.forEach((property) => {
        const mapdata = JSON.parse(
          this.authService.getAttributionData(property.propertyName + topic)
        );
        attributions = attributions.concat(mapdata)
      })
      // attributions = JSON.parse(
      //   this.authService.getAttributionData(propertyName + topic)
      // );
    } else {
      this.PropertyList.map((property) => {
        const attributionData = JSON.parse(
          this.authService.getAttributionData(property.label + topic)
        );
        attributions = attributions.concat(attributionData);
      });
    }
    return [...new Set(attributions)];
  }

  getHCSCountPerReview(data, previousData, topic) {
    let attributions: any = [];
    attributions = this.getTopicAttributions(
      this.selectedProperty.propertyName,
      topic
    );
    const dayData =
      attributions &&
      data.filter((review) => attributions.includes(review.entityWord));
    const prevDayData =
      previousData &&
      previousData.filter((review) => attributions.includes(review.entityWord));
    const hcsCount =
      dayData &&
      dayData.length > 0 &&
      dayData.map((review) => review.hcs).reduce((a, b) => a + b, 0) /
        dayData.length;
    const previousHcsCount =
      prevDayData &&
      prevDayData.length > 0 &&
      prevDayData.map((review) => review.hcs).reduce((a, b) => a + b, 0) /
        prevDayData.length;

    const hcsGrowth =
      previousData &&
      previousData.length > 0 &&
      previousHcsCount != 0 &&
      previousHcsCount != 0
        ? Number(
            (((hcsCount - previousHcsCount) / previousHcsCount) * 100).toFixed(
              2
            )
          )
        : "No Data";
    const hcsData = { data: [], creationTime: [] };
    dayData &&
      dayData.length > 0 &&
      dayData
        .sort(
          (d1, d2) =>
            new Date(d1.creationTime).getTime() -
            new Date(d2.creationTime).getTime()
        )
        .forEach((review) => {
          hcsData.data.push(review.hcs);
          hcsData.creationTime.push(
            moment(review.creationTime).format("DD MMM,YYYY")
          );
        });
    // this.hcsCardData = { data: [], creationTime: [] };
    //     (data || [])
    //       .sort((a, b) => new Date(a.creationTime).getTime() - new Date(b.creationTime).getTime())
    //       .forEach(obj => );
    return {
      hcs: dayData && dayData.length > 0 ? hcsCount.toFixed(2) : 0,
      entity: topic,
      variation: hcsGrowth,
      hcsData,
    };
  }

  calculateTrends(response) {
    // const topicTrends: any = [];

    // this.topics.map((topic, index) => {
    const trend = this.getDailyTrendCount(response);
    //   topicTrends.push(trend);
    // });
    this.dailyTrendData = trend;
  }

  sortData(data) {
    return data.sort(
      (d1, d2) => new Date(d1).getTime() - new Date(d2).getTime()
    );
  }

  getDailyTrendCount(filteredData) {
    // let attributions = [];
    // attributions = this.getTopicAttributions(
    //   this.selectedProperty.propertyName,
    //   topic
    // );
    // attributions.includes(review.entityWord)
    const dayData = filteredData.filter((review) => {
      review.creationTime = moment(review.creationTime).format("DD,MMM,YYYY");
      return true;
    });
    let filteredDates: any = dayData.map((date) => date.creationTime);

    const uniqueDates = new Set(filteredDates);
    filteredDates = [...uniqueDates];
    filteredDates = this.sortData(filteredDates);

    const positive: number[] = [];
    const neutral: number[] = [];
    const negative: number[] = [];
    filteredDates.map((date) => {
      const newData = dayData.filter((review) => review.creationTime === date);

      const positiveHCS = newData
        .filter((item) => item.hcs >= 1.25)
        .map((item) => item.hcs);
      const positiveHCSAvg = positiveHCS.length
        ? positiveHCS.reduce((sum, val) => sum + val, 0) / positiveHCS.length
        : 0;
      positive.push(positiveHCSAvg);

      const neutralHCS = newData
        .filter((item) => item.hcs > -1.25 && item.hcs < 1.25)
        .map((item) => item.hcs);
      const neutralHCSAvg = neutralHCS.length
        ? neutralHCS.reduce((sum, val) => sum + val, 0) / neutralHCS.length
        : 0;
      neutral.push(neutralHCSAvg);
      const negativeHCS = newData
        .filter((item) => item.hcs <= -1.25)
        .map((item) => item.hcs);
      const negativeHCSAvg = negativeHCS.length
        ? negativeHCS.reduce((sum, val) => sum + val, 0) / negativeHCS.length
        : 0;
      negative.push(negativeHCSAvg);
    });
    const array = [
      {
        name: "Positive",
        data: positive,
        color: "#4caf50",
        type: "column",
        stack: "positiveStack",
      },
      {
        name: "Neutral",
        data: neutral,
        color: "#ff9800",
        type: "column",
        stack: "neutralStack",
      },
      {
        name: "Negative",
        data: negative,
        color: "#f44336",
        type: "column",
        stack: "negativeStack",
      },
    ];

    //  , name: topic
    return { series: array, label: filteredDates };
  }

  showTrends(topicTrends, filteredDates) {
    Highcharts.chart("splineChart", {
      chart: {
        type: "spline",
      },
      title: {
        text: "Yearly Trends",
      },
      xAxis: {
        type: "datetime",
        categories: filteredDates,
      },
      yAxis: {
        title: {
          text: "ECS",
        },
      },
      plotOptions: {
        series: {
          marker: {
            enabled: true,
          },
        },
      },
      series: topicTrends,
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              legend: {
                layout: "horizontal",
                align: "center",
                verticalAlign: "bottom",
              },
            },
          },
        ],
      },
    });
  }

  calculateDailyTrendDataByDays(response) {
    const data = [["Day", "ECS", "ESS"]];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    for (let i = 0; i <= 6; i++) {
      const trend = [];
      trend.push(days[i]);
      const trendCounts = this.getDailyCount(response, i);
      trend.push(trendCounts.ecs);
      trend.push(trendCounts.ess);
      data.push(trend);
    }
    this.showDayWiseTrends(data);
  }

  getDailyCount(data, day) {
    const dayData = data.filter(
      (review) => moment(review.creationTime).day() === day
    );
    const ecsCount = dayData
      .map((review) => review.hcs)
      .reduce((a, b) => a + b, 0);
    const essCount = dayData
      .map((review) => review.hss)
      .reduce((a, b) => a + b, 0);
    return {
      ecs: Number((ecsCount / dayData.length).toFixed(2)),
      ess: Number((essCount / dayData.length).toFixed(2)),
    };
  }

  showDayWiseTrends(data) {
    google.charts.load("current", { packages: ["bar"] });
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
      let datatoChart = google.visualization.arrayToDataTable(data);
      const options = {
        height: 300,
        title: "ECS, ESS",
        chartArea: { width: "50%" },
        isStacked: true,
        hAxis: {
          title: "ECS, ESS",
          minValue: 0,
        },
        vAxis: {
          title: "Days",
        },
        colors: ["#A389D4", "#04a9f5"],
        bars: "horizontal",
      };
      const chart = new google.charts.Bar(
        document.querySelector("#barChart_data_day")
      );
      chart.draw(datatoChart, google.charts.Bar.convertOptions(options));
    }
  }

  calculateSourceTrendData(response) {
    const ecsCounts = [];
    const essCounts = [];
    const hisCounts = [];
    for (let i = 0; i < 7; i++) {
      const values = this.getYearlyTrendCount(response, i);
      ecsCounts.push(values.ecs);
      essCounts.push(values.ess);
      hisCounts.push(values.his);
    }
    this.createSourceTrendChart(ecsCounts, essCounts, hisCounts);
  }

  getYearlyTrendCount(data, month) {
    const dayData = data.filter(
      (review) => moment(review.creationTime).month() === month
    );
    const ecsCount =
      dayData.length > 0
        ? dayData.map((review) => review.hcs).reduce((a, b) => a + b, 0)
        : 0;
    const essCount =
      dayData.length > 0
        ? dayData.map((review) => review.hss).reduce((a, b) => a + b, 0)
        : 0;
    const hisCount =
      dayData.length > 0
        ? dayData.map((review) => review.salience).reduce((a, b) => a + b, 0)
        : 0;
    return {
      ecs: (ecsCount / dayData.length).toFixed(2),
      ess: (essCount / dayData.length).toFixed(2),
      his: (hisCount / dayData.length).toFixed(2),
    };
  }

  createSourceTrendChart(ecsCount, essCounts, hisCounts) {
    // sources trend
    this.lineAreaOption = {
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["ECS", "ESS", "HIS"],
      },
      toolbox: {
        show: false,
        feature: {
          mark: {
            show: true,
          },
          dataView: {
            show: true,
            readOnly: false,
          },
          magicType: {
            show: true,
            type: ["line", "bar", "stack", "tiled"],
          },
          restore: {
            show: true,
          },
          saveAsImage: {
            show: true,
          },
        },
      },
      calculable: true,
      xAxis: [
        {
          type: "category",
          splitLine: {
            show: false,
          },
          boundaryGap: false,
          data: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
      ],
      color: [
        "rgba(163, 137, 212, 0.5)",
        "rgba(4, 169, 246, 0.5)",
        "rgba(28, 233, 181, 0.5)",
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "ecs",
          type: "line",
          smooth: true,
          itemStyle: {
            normal: {
              areaStyle: {
                type: "macarons",
              },
            },
          },
          data: ecsCount,
        },
        {
          name: "ess",
          type: "line",
          smooth: true,
          itemStyle: {
            normal: {
              areaStyle: {
                type: "macarons",
              },
            },
          },
          data: essCounts,
        },
        {
          name: "his",
          type: "line",
          smooth: true,
          itemStyle: {
            normal: {
              areaStyle: {
                type: "macarons",
              },
            },
          },
          data: hisCounts,
        },
      ],
    };
  }

  getTopicImportanceCount(data) {
    const ecsCounts = [];
    const essCounts = [];
    const hisCounts = [];
    (this.topics ?? []).map((topic) => {
      const values = this.getTopicImportancePerReview(data, topic);
      ecsCounts.push(values.ecs);
      essCounts.push(values.ess);
      hisCounts.push(values.his);
    });
    this.showTopicsImportance(ecsCounts, essCounts, hisCounts);
  }

  getTopicImportancePerReview(data, topic) {
    let attributions = [];
    attributions = this.getTopicAttributions(
      this.selectedProperty.propertyName,
      topic
    );
    const dayData = data.filter((review) =>
      attributions.includes(review.entityWord)
    );
    const ecsCount = dayData
      .map((review) => review.hcs)
      .reduce((a, b) => a + b, 0);
    const essCount = dayData
      .map((review) => review.hss)
      .reduce((a, b) => a + b, 0);
    const hisCount = dayData
      .map((review) => review.salience)
      .reduce((a, b) => a + b, 0);

    return {
      ecs:
        dayData && dayData.length > 0
          ? (ecsCount / dayData.length).toFixed(2)
          : 0,
      ess:
        dayData && dayData.length > 0
          ? (essCount / dayData.length).toFixed(2)
          : 0,
      his:
        dayData && dayData.length > 0
          ? (hisCount / dayData.length).toFixed(2)
          : 0,
    };
  }

  showTopicsImportance(ecsCounts, essCounts, hisCounts) {
    /* bar basic chart */
    const bar_basic_tag = (<HTMLCanvasElement>(
      this.barHorizontalChart.nativeElement
    )).children;
    this.barHorizontalChartTag =
      bar_basic_tag["bar_horizontal_chart"].lastChild.getContext("2d");
    const abc = this.barHorizontalChartTag.createLinearGradient(0, 300, 0, 0);
    abc.addColorStop(0, "#333f54"); // Updated portal base color
    abc.addColorStop(1, "#3f4d67"); // Slightly lighter version

    // Updated light portal gradient
    const def = this.barHorizontalChartTag.createLinearGradient(0, 300, 0, 0);
    def.addColorStop(0, "#3f4d67"); // Light portal base color
    def.addColorStop(1, "#5a6b86");
    const ghi = this.barHorizontalChartTag.createLinearGradient(0, 300, 0, 0);
    ghi.addColorStop(0, "#FF6B6B"); // Warm red
    ghi.addColorStop(1, "#FFE66D");

    const topics = this.topics;
    // hisCounts.sort((d1, d2) => d2 - d1);

    this.barHorizontalChartData = {
      labels: topics,
      datasets: [
        {
          label: "Topic Sentiment",
          data: ecsCounts,
          borderColor: abc,
          backgroundColor: abc,
          hoverborderColor: abc,
          hoverBackgroundColor: abc,
        },
        // {
        //   label: "ESS",
        //   data: essCounts,
        //   borderColor: ghi,
        //   backgroundColor: ghi,
        //   hoverborderColor: ghi,
        //   hoverBackgroundColor: ghi,
        // },
        {
          label: "Importance",
          data: hisCounts,
          borderColor: def,
          backgroundColor: def,
          hoverborderColor: def,
          hoverBackgroundColor: def,
        },
      ],
    };

    this.barHorizontalChartOption = {
      barValueSpacing: 50,
        responsive: true,
  maintainAspectRatio: false,
    };
  }

  calculateMapData(response) {
    let mapData = this.selectOptionService.getMapCountries();
    mapData = mapData.map((map) => this.getCountryCount(response, map));
    this.createMap(mapData);
  }

  getCountryCount(data, map) {
    const dayData = data.filter((review) => review.country === map.country);
    const hcsCount = dayData
      .map((review) => review.hcs)
      .reduce((a, b) => a + b, 0);
    map.hcs =
      dayData.length > 0 ? Number((hcsCount / dayData.length).toFixed(2)) : 0;
    map.count = dayData.length;
    map.countPercentange =
      dayData.length && data && (dayData.length / data.length) * 100;
    map.countryFlag = `https://flagcdn.com/w40/${map.code.toLowerCase()}.png`;
    return map;
  }

  createMap(mapData) {
    const minBulletSize = 3;
    const maxBulletSize = 70;
    let min = Infinity;
    let max = -Infinity;
    let i;
    let value;

    mapData.map((map) => {
      value = map.count;
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    });

    const maxSquare = maxBulletSize * maxBulletSize * 2 * Math.PI;
    const minSquare = minBulletSize * minBulletSize * 2 * Math.PI;
    const mapValues = [];
    for (i = 0; i < mapData.length; i++) {
      const dataItem = mapData[i];
      if (dataItem.hcs > 0 || dataItem.hcs < 0) {
        value = dataItem.hcs;
        const count = dataItem.count;
        if (value >= -4.5 && value <= 0) {
          dataItem.color = "red";
        } else if (value > 0 && value <= 2.99) {
          dataItem.color = "yellow";
        } else {
          dataItem.color = "green";
        }
        let square =
          ((count - min) / (max - min)) * (maxSquare - minSquare) + minSquare;
        if (square < minSquare) {
          square = minSquare;
        }
        const size = Math.sqrt(square / (Math.PI * 8));
        const id = dataItem.code;

        mapValues.push({
          lon: dataItem.longitude,
          user: dataItem.count,
          color: dataItem.color,
          lat: dataItem.latitude,
          name: dataItem.country,
          value: value,
          userPercent: dataItem.countPercentange,
          countryFlag: dataItem.countryFlag,
        });
      }
    }
    this.worldMapData = mapValues;
    this.renderMap();
  }

  calculateBubbleChartData(data) {
    const dataValues = [["ID", "HIS", "ECS", "Attributes", "No of Mentions"]];

    this.attributions.map((attribute) => {
      const value = [];
      const chartValue = this.getBubbleChartValues(data, attribute);
      value.push(chartValue.country);
      value.push(chartValue.his);
      value.push(chartValue.ecs);
      value.push(attribute);
      value.push(chartValue.counts);
      dataValues.push(value);
    });
    this.showBubbleChart(dataValues);
  }

  getBubbleChartValues(data, attribute) {
    const dayData = data.filter((review) => review.entityWord === attribute);
    const numberOfMentionsCount = dayData
      .map((review) => review.numberOfMentions)
      .reduce((a, b) => a + b, 0);
    const ecsCount = dayData
      .map((review) => review.hcs)
      .reduce((a, b) => a + b, 0);
    const hisCount = dayData
      .map((review) => review.salience)
      .reduce((a, b) => a + b, 0);
    return {
      ecs: Number((ecsCount / dayData.length).toFixed(2)),
      his: Number((hisCount / dayData.length).toFixed(2)),
      country: attribute,
      counts: numberOfMentionsCount,
    };
  }

  showBubbleChart(dataValues) {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
      let datatoChart = google.visualization.arrayToDataTable(dataValues);
      const options = {
        height: 300,
        title: "Correlation between ECS, HIS " + "and Counts",
        hAxis: { title: "HIS" },
        vAxis: { title: "ECS" },
        bubble: { textStyle: { fontSize: 11 } },
        colors: ["#1de9b6", "#04a9f5", "#A389D4"],
      };
      const chart = new google.visualization.BubbleChart(
        document.getElementById("bubbleChart")
      );
      chart.draw(datatoChart, options);
    }
  }

  getTopicMonthCount(data) {
    const ecsCounts = [];
    const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    // this.topics.map((topic, index) => {
    // const ecsObj = {
    //   name: topic,
    //   type: index % 2 === 0 ? 'line' : 'column',
    //   data: [],
    //   color: this.colorPalette[index % this.colorPalette.length]
    // }
    //   ecsObj.data.push();

    //   ecsCounts.push(this.getMonthlyTopicPerReview(data, topic, month));
    // });
    this.monthlyTrendData = this.getMonthlyTopicPerReview(data, month);
  }

  getMonthlyTopicPerReview(data, month) {
    // let attributions = [];
    // attributions = this.getTopicAttributions(
    //   this.selectedProperty.propertyName,
    //   topic
    // );
    // attributions.includes(review.entityWord) &&
    // , name: topic

    const positive: number[] = [];
    const neutral: number[] = [];
    const negative: number[] = [];
    for (let month = 1; month <= 12; month++) {
      const dayData = data.filter(
        (review) => moment(review.creationTime).month() + 1 === month
      );
      const positiveHCS = dayData
        .filter((item) => item.hcs >= 1.25)
        .map((item) => item.hcs);
      const positiveHCSAvg = positiveHCS.length
        ? positiveHCS.reduce((sum, val) => sum + val, 0) / positiveHCS.length
        : 0;
      positive.push(positiveHCSAvg);

      const neutralHCS = dayData
        .filter((item) => item.hcs > -1.25 && item.hcs < 1.25)
        .map((item) => item.hcs);
      const neutralHCSAvg = neutralHCS.length
        ? neutralHCS.reduce((sum, val) => sum + val, 0) / neutralHCS.length
        : 0;
      neutral.push(neutralHCSAvg);
      const negativeHCS = dayData
        .filter((item) => item.hcs <= -1.25)
        .map((item) => item.hcs);
      const negativeHCSAvg = negativeHCS.length
        ? negativeHCS.reduce((sum, val) => sum + val, 0) / negativeHCS.length
        : 0;
      negative.push(negativeHCSAvg);
    }
    const array = [
      {
        name: "Positive",
        data: positive,
        color: "#4caf50",
        type: "column",
        stack: "positiveStack",
      },
      {
        name: "Neutral",
        data: neutral,
        color: "#ff9800",
        type: "column",
        stack: "neutralStack",
      },
      {
        name: "Negative",
        data: negative,
        color: "#f44336",
        type: "column",
        stack: "negativeStack",
      },
    ];

    return { series: array, label: month };
  }

  getYearlyTopicPerReview(data) {
    // let attributions = [];
    // attributions = this.getTopicAttributions(
    //   this.selectedProperty.propertyName,
    //   topic
    // );
    // const yearData = data.filter(
    //   (review) =>
    //     attributions.includes(review.entityWord)
    // );
    let years = data.map((review) => moment(review.creationTime).year());
    const yearLabels = new Set(years);
    years = [...yearLabels];
    const positive: number[] = [];
    const neutral: number[] = [];
    const negative: number[] = [];
    years.map((year) => {
      const newData = data.filter(
        (review) => moment(review.creationTime).year() === year
      );
      const positiveHCS = newData
        .filter((item) => item.hcs >= 1.25)
        .map((item) => item.hcs);
      const positiveHCSAvg = positiveHCS.length
        ? positiveHCS.reduce((sum, val) => sum + val, 0) / positiveHCS.length
        : 0;
      positive.push(positiveHCSAvg);

      const neutralHCS = newData
        .filter((item) => item.hcs > -1.25 && item.hcs < 1.25)
        .map((item) => item.hcs);
      const neutralHCSAvg = neutralHCS.length
        ? neutralHCS.reduce((sum, val) => sum + val, 0) / neutralHCS.length
        : 0;
      neutral.push(neutralHCSAvg);
      const negativeHCS = newData
        .filter((item) => item.hcs <= -1.25)
        .map((item) => item.hcs);
      const negativeHCSAvg = negativeHCS.length
        ? negativeHCS.reduce((sum, val) => sum + val, 0) / negativeHCS.length
        : 0;
      negative.push(negativeHCSAvg);
    });
    const array = [
      {
        name: "Positive",
        data: positive,
        color: "#4caf50",
        type: "column",
        stack: "positiveStack",
      },
      {
        name: "Neutral",
        data: neutral,
        color: "#ff9800",
        type: "column",
        stack: "neutralStack",
      },
      {
        name: "Negative",
        data: negative,
        color: "#f44336",
        type: "column",
        stack: "negativeStack",
      },
    ];

    return { series: array, label: years };
  }

  showTopicBarChart(ecsCounts) {
    Highcharts.chart("barChart", {
      chart: {
        type: "column",
      },
      colors: ["#2196f3", "#7759de", "#f44336", "#00ACC1"],
      title: {
        text: "Monthly Average",
      },
      xAxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        crosshair: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: "ECS",
        },
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat:
          '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
        footerFormat: "</table>",
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
      },
      series: ecsCounts,
    });
  }

  calculateAttributeDate(response, previousData) {
    this.tableFilteredData = [];
    this.attributeTableFilteredData = this.tableFilteredData;

    (this.attributions ?? []).map((attribute) => {
      const data = this.getAttributionCountPerReview(
        response,
        previousData,
        attribute
      );
      if (data.mention != 0) {
        this.tableFilteredData.push(data);
      }
      const newData = this.tableFilteredData.sort(
        (d1, d2) => d2.mention - d1.mention
      );
      this.tableFilteredData = this.tableFilteredData
        .sort((d1, d2) => d2.mention - d1.mention)
        .map((review) => {
          if (review.ecs <= -1.25) {
            review.sentiment = "Negative";
          } else if (review.ecs > -1.25 && review.ecs < 1.25) {
            review.sentiment = "Neutral";
          } else if (review.ecs >= 1.25) {
            review.sentiment = "Positive";
          }
          return review;
        });
      this.attributeTableFilteredData = this.tableFilteredData;
    });
  }

  getAttributionCountPerReview(data, previousData, attribute) {
    const dayData = data.filter(
      (review) => review.entityWord.toLowerCase() === attribute.toLowerCase()
    );
    const previousDayData =
      previousData &&
      previousData.filter(
        (review) => review.entityWord.toLowerCase() === attribute.toLowerCase()
      );
    const ecsCount = dayData
      .map((review) => review.hcs)
      .reduce((a, b) => a + b, 0);
    const previousEcsCount =
      previousDayData &&
      previousDayData.map((review) => review.hcs).reduce((a, b) => a + b, 0);
    // tslint:disable-next-line:max-line-length
    const ecsGrowth =
      previousData && previousData.length > 0 && previousEcsCount != 0
        ? ((ecsCount - previousEcsCount) / previousEcsCount) * 100
        : "No Data";
    const hisCount = dayData
      .map((review) => review.salience)
      .reduce((a, b) => a + b, 0);
    return {
      ecs: dayData.length > 0 ? (ecsCount / dayData.length).toFixed(2) : 0,
      entity: attribute,
      mention: dayData ? dayData.length : 0,
      percentage:
        ecsGrowth && ecsGrowth !== "No Data" ? ecsGrowth.toFixed(2) : 0,
      his: dayData.length > 0 ? (hisCount / dayData.length).toFixed(2) : 0,
    };
  }

  showSpinner(name: string) {
    this.spinner.show(name);
  }

  hideSpinner(name: string) {
    this.spinner.hide(name);
  }
}













// //updateAttributeListByTopic(values: string[]): void {
//   let combinedAttributions: any[] = [];
//   // Loop through all selected topics
//   values.forEach((value) => {
//     // For each property in PropertyList
//     this.PropertyList.forEach((property) => {
//       console.log('property: ', property);
//       try {
//         const rawData = this.authService.getAttributionData(property.label + value);
//         console.log('rawData: ', rawData);
//         const parsedData = JSON.parse(rawData);

//         if (Array.isArray(parsedData)) {
//           combinedAttributions = combinedAttributions.concat(parsedData);
//         }
//       } catch (e) {
//         console.error(
//           `Failed to parse attribution data for property: ${property.label}, topic: ${value}`,
//           e
//         );
//       }
//     });
//   });
//   // Remove duplicates (assuming string array)
//   this.attributions = Array.from(new Set(combinedAttributions));
//   console.log('this.attributions: ', this.attributions);
//   // Update UI options
//   this.getAttributeOptions(this.attributions);
// }

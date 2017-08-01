$(document).ready(function() {
    drawGraph();
});
$('input').change(function () {
    drawGraph();
});
function Annotation(id, year, color, msg) {
    if (typeof Annotation.counter == 'undefined') {
        Annotation.counter = 1;
    } else {
        Annotation.counter++;
    }
    this.drawTime = "afterDraw";
    this.id = id;
    this.type = "line";
    this.mode = "vertical";
    this.scaleID = "x-axis-0";
    this.value = year;
    this.borderColor = color;
    this.borderWidth = 3;
    this.label = {
        position: "top",
        yAdjust: Annotation.counter * 25,
        backgroundColor: color,
        content: year + ": " + msg,
        enabled: true
    };
}
function drawGraph(){
    Annotation.counter = 0;
    $("#total-budget-growth-fg").removeClass("has-error");
    $("#school-budget-growth-fg").removeClass("has-error");
    $("#starting-total-budget-fg").removeClass("has-error");
    $("#starting-school-budget-fg").removeClass("has-error");
    $("#total-years-fg").removeClass("has-error");
    $("#starting-year-fg").removeClass("has-error");
    $("#budget-alerts").html("");

    var hasErrors = false;

    var totalGrowthRate = $("#total-budget-growth").val();
    var schoolGrowthRate = $("#school-budget-growth").val();
    var startingTotalBudget = $("#starting-total-budget").val();
    var startingSchoolBudget = $("#starting-school-budget").val();
    var startingYear = $("#starting-year").val();
    var totalYears = $("#total-years").val();

    if ($.isNumeric(totalGrowthRate)) {
        totalGrowthRate = parseFloat(totalGrowthRate) / 100;
    } else {
        hasErrors = true;
        $("#total-budget-growth-fg").addClass("has-error");
    }
    if ($.isNumeric(schoolGrowthRate)) {
        schoolGrowthRate = parseFloat(schoolGrowthRate) / 100;
    } else {
        hasErrors = true;
        $("#school-budget-growth-fg").addClass("has-error");
    }
    if ($.isNumeric(startingTotalBudget)) {
        startingTotalBudget = parseFloat(startingTotalBudget);
    } else {
        hasErrors = true;
        $("#starting-total-budget-fg").addClass("has-error");
    }
    if ($.isNumeric(startingSchoolBudget)) {
        startingSchoolBudget = parseFloat(startingSchoolBudget);
    } else {
        hasErrors = true;
        $("#starting-school-budget-fg").addClass("has-error");
    }
    if (Math.floor(startingYear) == startingYear && $.isNumeric(startingYear)) {
        startingYear = parseInt(startingYear);
    } else {
        hasErrors = true;
        $("#starting-year-fg").addClass("has-error");
    }
    if (Math.floor(totalYears) == totalYears && $.isNumeric(totalYears)) {
        totalYears = parseInt(totalYears);
    } else {
        hasErrors = true;
        $("#total-years-fg").addClass("has-error");
    }
    if (hasErrors) {
        return;
    }
    var total_growth = 1 + totalGrowthRate;
    var school_growth = 1 + schoolGrowthRate;
    var total_budget = [startingTotalBudget];
    var school_budget = [startingSchoolBudget];
    var remaining_budget = [total_budget[0] - school_budget[0]];
    var labels = [startingYear];
    var beganBudgetCuts = false;
    var depletedNonSchoolBudget = false;
    var annotations = []
    for (let i=1; i < totalYears; i++) {
        total_budget[i] = total_budget[i-1] * total_growth;
        school_budget[i] = school_budget[i-1] * school_growth;
        remaining_budget[i] = total_budget[i] - school_budget[i];
        labels[i] = labels[i-1] + 1;
        if (!beganBudgetCuts && remaining_budget[i] < remaining_budget[i-1]) {
            beganBudgetCuts = true;
            annotations.push(new Annotation("budget_cuts", labels[i], 'rgba(255, 127, 0, 0.6)', "Budget cuts necessary"));
        }
        if (!depletedNonSchoolBudget && remaining_budget[i] < 0) {
            depletedNonSchoolBudget = true;
            annotations.push(new Annotation("budget_depleted", labels[i], 'rgba(255, 0, 0, 0.5)', "Non-school budget depleted"));
        }
    }
    var ctx = $("#myChart");
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Budget',
                data: total_budget,
                fill: false,
                backgroundColor: 'rgba(255,99,132,1)',
                borderColor: 'rgba(255,99,132,1)'
            },{
                label: 'School Budget',
                data: school_budget,
                fill: false,
                backgroundColor: 'rgba(54, 162, 235, 1)',
                borderColor: 'rgba(54, 162, 235, 1)'
            },{
                label: 'Non-School Budget',
                data: remaining_budget,
                fill: false,
                backgroundColor: 'rgba(255, 206, 86, 1)',
                borderColor: 'rgba(255, 206, 86, 1)'
            }]
        },
        options: {
            annotation: {
              annotations: annotations
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}


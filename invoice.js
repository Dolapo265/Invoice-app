
 let shiftEntries = JSON.parse(sessionStorage.getItem('shiftEntries')) || []

document.getElementById('form').addEventListener('submit', function(event){
    event.preventDefault();
       
        let singleEntry = {
         invoiceNumber :document.getElementById('invoice-number').value,
         pharmacistName :document.getElementById('name').value,
         date :document.getElementById('date').value,
         startTime :document.getElementById('start-time').value,
         endTime :document.getElementById('end-time').value,
         rate :document.getElementById('rate').value,
         pharmacy :document.getElementById('pharmacy-name').value
        };

        shiftEntries.push(singleEntry);
        sessionStorage.setItem('shiftEntries', JSON.stringify(shiftEntries));
        populateTable();
        updateFinalTotal();

        document.querySelector('.form-container').style.display = 'none';
        document.querySelector('.results-container').style.display = 'block';

        document.getElementById('pharmacist-name-details').textContent = singleEntry.pharmacistName;
        document.getElementById('pharmacy-name-details').textContent = singleEntry.pharmacy;
        


       
      
});

document.getElementById('new-entry').addEventListener('click', function() {
    document.querySelector('.results-container').style.display = 'none';
    document.querySelector('.form-container').style.display = 'block';
    document.getElementById('form').reset();
});
        

function populateTable (){
        const tbody = document.getElementById('results-tbody');
        tbody.innerHTML = '';
        
        shiftEntries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.pharmacy}</td>
        <td>${entry.startTime}</td>
        <td>${entry.endTime}</td>
        <td>${(timeStringToFloat(entry.endTime) - timeStringToFloat(entry.startTime)).toFixed(2)}</td>
        <td>${Number(entry.rate).toFixed(2)}</td>
        <td>${calculateTotal(entry.startTime, entry.endTime, entry.rate).toFixed(2)}</td>
        <td>${entry.invoiceNumber}</td>
    `;
         tbody.appendChild(row);
        })
    };

window.onload = populateTable;
        
function timeStringToFloat(time){
    let hoursMinutes = time.split(':')
    time = Number(hoursMinutes[0]) + Number(hoursMinutes[1])/60
     return Number(time.toFixed(2))
}

function calculateTotal (startTime,endTime,rate){
    if (endTime>startTime){
    const hoursWorked = timeStringToFloat(endTime) - timeStringToFloat(startTime)
    const total = hoursWorked * rate    
        return total
    } else {
        alert( 'End time needs to be after start time')
    }
}

function updateFinalTotal() {
    let total = 0;
    for (let i = 0; i < shiftEntries.length; i++) {
    const entry = shiftEntries[i];
    const shiftTotal = calculateTotal(entry.startTime, entry.endTime, entry.rate);
    total += shiftTotal;
  }
    document.getElementById('final-total').textContent = total.toFixed(2);
}

document.getElementById('download-pdf').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.text("Shift Entries Report", 14, 20);

    // Prepare table data
    const headers = [["Date", "Pharmacy", "Start", "End", "Hours", "Rate", "Total", "Invoice #"]];
    const data = shiftEntries.map(entry => [
        entry.date,
        entry.pharmacy,
        entry.startTime,
        entry.endTime,
        (timeStringToFloat(entry.endTime) - timeStringToFloat(entry.startTime)).toFixed(2),
        Number(entry.rate).toFixed(2),
        calculateTotal(entry.startTime, entry.endTime, entry.rate).toFixed(2),
        entry.invoiceNumber
    ]);

    // AutoTable
    doc.autoTable({
        head: headers,
        body: data,
        startY: 30,
    });

    // Add final total at bottom
    const finalTotal = shiftEntries.reduce((sum, entry) => sum + calculateTotal(entry.startTime, entry.endTime, entry.rate), 0).toFixed(2);
    doc.text(`Final Total: $${finalTotal}`, 14, doc.lastAutoTable.finalY + 10);

    doc.save("shift_entries.pdf");
});



function removeZero(i) {
    return () => {
        zero = zeros[i]
        if(zero.im != 0) {
            if(i > 0) 
                prevzero = zeros[i-1] 
            else
                prevzero = 0
            if(i + 1 < zeros.length)
                postzero = zeros[i+1]
            else
                postzero = 0
            if(zero.re == prevzero.re && zero.im == -prevzero.im) {
                zeros.splice(i-1, 2)
            }

            if(zero.re == postzero.re && zero.im == -postzero.im) {
                zeros.splice(i, 2)
            }
        } else {
            zeros.splice(i, 1)
        }
        renewSingularityList(zeros, "Cero", 'row-cero', removeZero)
        updateTransferFunction()
        updatePZMap()
    }
}

function removePole(i) {
    return () => {
        pole = poles[i]
        if(pole.im != 0) {
            if(i > 0) 
                prevpole = poles[i-1] 
            else
                prevpole = 0
            if(i + 1 < poles.length)
                postpole = poles[i+1]
            else
                postpole = 0
            if(pole.re == prevpole.re && pole.im == -prevpole.im) {
                poles.splice(i-1, 2)
            }

            if(pole.re == postpole.re && pole.im == -postpole.im) {
                poles.splice(i, 2)
            }
        } else {
            poles.splice(i, 1)
        }
        renewSingularityList(poles, "Polo", 'row-polo', removePole)
        updateTransferFunction()
        updatePZMap()
    }
}

function renewSingularityList (singarr, text, classname, removefungen) {
    document.querySelectorAll('.'+classname).forEach(e => e.remove());
    
    singarr.forEach(function (item, i) {
        var row = table.insertRow(3+i);
        row.classList.add(classname)
        var btn = document.createElement("BUTTON");
        var t = document.createTextNode("X");
        btn.appendChild(t);
        btn.onclick = removefungen(i)
        addCell(row, math.format(item));
        var td = row.insertCell();
        td.appendChild(btn);
    });
}
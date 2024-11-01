// poles = [
//     math.evaluate('-10 + 10*i'),
//     math.evaluate('-10-10*i'),
//     // math.evaluate('-10'),
//     // math.evaluate('-20'),
//     math.evaluate('-50'),
// ]
// zeros = [
//     math.evaluate('-10'),
//     // math.evaluate('-15'),
//     // math.evaluate('+15')
// ]

var poles = []
var zeros = []

var num = '1'
var den = '1'

var root_loci = []

function updateTransferFunction() {
    den = build_polynomial_from_roots('s', '1', poles)
    sgn = 1
    zeros.forEach(z => {
        if(z.im == 0 && z.re > 0) {
            sgn *= -1
        }
    })
    num = build_polynomial_from_roots('s', sgn, zeros)
    root_loci = []
    gains = logspace(10, 0, 3, 300)
    //gains = linspace(0, 10000, 500)
    gains.forEach((g, i) => {
        _rl = get_root_locus(num, den, g)
        if(_rl.length==2)  {
            rl = []
            for(var j = 0; j < _rl[0].length; j++) {
                rl[j] = [_rl[0][j], _rl[1][j]]
            }
            root_loci.push(rl)
        } else 
            console.log(i, "notlength", _rl)
    });

    for(var j = 1; j < root_loci.length; j++) {
        new_rl = []
        for(l = 0; l < root_loci[j].length; l++) {
            lpole = math.complex(root_loci[j][l][0], root_loci[j][l][1])
            dist = []
            for(p = 0; p < root_loci[j-1].length; p++) {
                ppole = math.complex(root_loci[j-1][p][0], root_loci[j-1][p][1])
                dist[p] = math.evaluate('abs(p-l)', {p:ppole, l:lpole})
                // ACÁ PUEDEN SALTAR ERRORES SI EL SALTO DE GANANCIA ES DEMASIADO ALTO! quedan más cerca al mismo polo
            }
            // console.log(j, l, dist, argmin(dist))
            new_rl[argmin(dist)] = root_loci[j][l]
        }
        root_loci[j] = new_rl
    }
}

var gain_slider_field = document.getElementById('gain_slider_field')
var gain_slider = document.getElementById('gain_slider')

var table = document.getElementById("tabla");

// helper function        
function addCell(tr, text) {
    var td = tr.insertCell();
    td.textContent = text;
    return td;
}


function updatePZMap () {
    gain_slider_field.value = gain_slider.value
    var radius = 100;	// radius of unit circle
    var pSize = 4;		// size of pole and zero graphic
    var zSize = 4;
    var c = document.getElementById('pzmap')
    var ctx=c.getContext("2d");

    ctx.clearRect(0, 0, c.width, c.height);

    var pad = (c.width - 2 * radius) / 2; // padding on each side
    
    // unit circle
    ctx.beginPath();
    ctx.strokeStyle="red";
    ctx.arc(radius+pad, radius+pad, radius, 0, 2*Math.PI);
    ctx.stroke();

    // y axis
    ctx.beginPath(); 
    //ctx.lineWidth="1";
    ctx.strokeStyle="lightgray";
    ctx.moveTo(radius+pad,0);
    ctx.lineTo(radius+pad,c.height);
    ctx.font = "italic 8px sans-serif";
    ctx.fillText("Im", radius+pad+2, pad-2);
    
    // x axis
    ctx.moveTo(0,radius+pad);
    ctx.lineTo(c.width,radius+pad);
    ctx.fillText("Re", radius+radius+pad+2, radius+pad-2);
    ctx.stroke(); // Draw it


    ctx.strokeStyle = "#FF00FF"
    if(root_loci.length) {
        // console.log(root_loci)
        for(pidx = 0; pidx < root_loci[0].length; pidx++) {
            ctx.beginPath();
            ctx.moveTo(radius + Math.round(root_loci[0][pidx][0]) + pad, radius - Math.round(root_loci[0][pidx][1]) + pad);
            for (idx = 0; idx < root_loci.length; idx++) {
                var x = radius + Math.round(root_loci[idx][pidx][0]);
                var y = radius - Math.round(root_loci[idx][pidx][1]);
                ctx.lineTo(x+pad, y+pad)
            }
            ctx.stroke();
        }
    }

    ctx.strokeStyle="blue";
    // poles
    var _poles = get_root_locus(num, den, gain_slider.value)
    console.log("POLES", _poles)
    if(_poles && _poles.length) {
        var poles = []
        
        for(var j = 0; j < _poles[0].length; j++) {
            poles[j] = [_poles[0][j], _poles[1][j]]
        }
        var idx;
        for (idx = 0; idx < poles.length; idx++) {
            var x = radius + Math.round(poles[idx][0]);
            var y = radius - Math.round(poles[idx][1]);
            ctx.beginPath();
            ctx.moveTo(x - pSize + pad, y - pSize + pad);
            ctx.lineTo(x + pSize + pad, y + pSize + pad);
            ctx.moveTo(x - pSize + pad, y + pSize + pad);
            ctx.lineTo(x + pSize + pad, y - pSize + pad);
            ctx.stroke();
        }
    }
    
    
    // zeros
    for (idx = 0; idx < zeros.length; idx++) {
        var x = radius;
        var y = radius;
        if(zeros.im) {
            x = radius + Math.round(zeros[idx].re);
            y = radius - Math.round(zeros[idx].im);
        } else {
            x = radius + Math.round(zeros[idx]);
        }
        ctx.beginPath();
        ctx.arc(x + pad, y + pad, zSize, 0, 2*Math.PI);
        ctx.stroke();
    }

    // calc max and min, because we may not end up sampling at that exact spot later (an issue at high Q, especially log plot)
    // var polePt = [poles[0][0], poles[0][1]];
    // if (Math.abs(poles[0][0]) < Math.abs(poles[1][0]))
    //     polePt[0] = poles[1][0];
    // var poleRadius = Math.sqrt(Math.pow(polePt[0], 2) + Math.pow(polePt[1], 2));
    // var poleAngle = Math.atan2(polePt[1], polePt[0]);
    // if(zeros.length){
    //     var zeroPt = [zeros[0][0], zeros[0][1]];
    //     if (Math.abs(zeros[0][0]) < Math.abs(zeros[1][0]))
    //         zeroPt[0] = zeros[1][0];
    //     var zeroRadius = Math.sqrt(Math.pow(zeroPt[0], 2) + Math.pow(zeroPt[1], 2));
    //     var zeroAngle = Math.atan2(zeroPt[1], zeroPt[0]);
    // }
}

gain_slider_field.oninput = () => {
    gain_slider.value = gain_slider_field.value
    updatePZMap()
}


gain_slider.oninput = updatePZMap
document.getElementById("addPole_btn").onclick = () => {
    var pole_re_in = document.getElementById('pole_re')
    var pole_im_in = document.getElementById('pole_im')
    var pole_re = pole_re_in.value
    pole_re_in.value = 0
    var pole_im = pole_im_in.value
    pole_im_in.value = 0

    if(pole_im != 0) {
        poles.push(math.complex(pole_re, pole_im))
        poles.push(math.complex(pole_re, -pole_im))
    } else {
        poles.push(math.complex(pole_re, 0))
    }

    poles_abs = []
    poles.forEach(p => {
        poles_abs.push(math.abs(p))
    })

    gain_slider.attributes.max.value = (min(poles_abs)*1000 + 10**poles.length)/2

    renewSingularityList(poles, "Polo", 'row-polo', removePole)
    updateTransferFunction()
    updatePZMap()

}

document.getElementById("addZero_btn").onclick = () => {
    var zero_re_in = document.getElementById('zero_re')
    var zero_im_in = document.getElementById('zero_im')
    var zero_re = zero_re_in.value
    zero_re_in.value = 0
    var zero_im = zero_im_in.value
    zero_im_in.value = 0

    if(zero_im != 0) {
        zeros.push(math.complex(zero_re, zero_im))
        zeros.push(math.complex(zero_re, -zero_im))
    } else {
        zeros.push(math.complex(zero_re, 0))
    }

    renewSingularityList(zeros, "Cero", 'row-cero', removeZero)
    updateTransferFunction()
    updatePZMap()
}


function build_polynomial_from_roots(variable, constant, roots) {
    poly = constant.toString()
    if(roots.length) {
        roots.forEach(r => {
            if(r.im && r.im != 0) {
                term = '*(' + variable + ' ^ 2 - ' + (2*r.re) + ' * s + ' + (r.re**2 + r.im**2) + ')'
            } else {
                term = '*(' + variable + '-' + r + ')'
            }
            if(!poly.includes(term))
                poly = poly.concat(term)
        });
    }
    return poly
}
function get_poly_coeffs_from_string(st) {
    if(st[0] == '(') {
        st = st.slice(1, -1)
    }
    st_terms = st.split(/ [+-] /)
    
    st_coeffs = []
    st_terms.forEach(t => {
        if(t.includes('s')) {
            if(t.includes('^')) {
                exponent = t.split(' ^ ').slice(-1)[0]
                if(t.includes('*')) {
                    multiplier = t.split(' * s')[0]
                } else {
                    multiplier = 1
                }
            } else {
                exponent = 1
                if(t.includes('*')) {
                    multiplier = t.split(' * s')[0]
                } else {
                    multiplier = 1
                }
            }
            st_coeffs[exponent] = Number(multiplier)
        } else {
            st_coeffs[0] = Number(t)
        }
    })
    st_coeffs = Array.from(st_coeffs, item => item || 0);
    st_coeffs.reverse()
    return st_coeffs
}

function get_system_tf(num, den, gain) {
    if(gain == 0) {
        num_loop = num
        den_loop = den
    } else {
        num_loop = gain.toString() + '*' + num
        den_loop = den + ' + ' + num_loop
    }
    tf_loop = num_loop + '/(' + den_loop + ')'
    return tf_loop
}

function get_root_locus(num, den, gain) {
    tf_loop_rat = math.format(math.rationalize(get_system_tf(num, den, gain)))
    tf_loop_rat_num = tf_loop_rat.split(' / ')[0]
    tf_loop_rat_den = tf_loop_rat.split(' / ')[1]
    if(tf_loop_rat_den)
        return roots(get_poly_coeffs_from_string(tf_loop_rat_den))
    else
        return []
}

function linspace(ini, end, points) {
    delta = (end - ini)/(points-1)
    vals = []
    for(var j = 0; j < points; j++) {
        vals.push(ini + j*delta)
    }
    return vals
}

function logspace(base, iniex, endex, points) {
    exponents = linspace(iniex, endex, points)
    vals = []
    for(var j = 0; j < points; j++) {
        vals.push(base**exponents[j])
    }
    return vals
}

function max(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return max;
}

function min(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var min = arr[0];
    var minIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }

    return min;
}

function argmin(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var min = arr[0];
    var minIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }

    return minIndex;
}
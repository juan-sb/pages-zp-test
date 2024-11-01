var math = require('mathjs')
var roots = require('poly-roots');

i = math.evaluate('i')
function get_magnitude(expr, iniexp, endexp, points) {
    exponents = []
    delta = (endexp - iniexp)/(points-1)
    for(var j = 0; j < points; j++) {
        exponents.push(j*delta)
    }
    freqs = []
    for(var j = 0; j < points; j++) {
        freqs.push(10**exponents[j])
    }
    return freqs
}

poles = [
    // math.evaluate('-10 + 10*i'),
    // math.evaluate('-10-10*i'),
    math.evaluate('-10'),
    math.evaluate('-20'),
    math.evaluate('-30')
]
zeros = [
    math.evaluate('-15'),
    math.evaluate('0')
]

numerator = ''
function build_polynomial_from_roots(variable, constant, roots) {
    poly = constant.toString()
    if(roots.length) {
        roots.forEach(r => {
            if(r.im && r.im != 0) {
                term = '*(' + variable + ' ^ 2 - ' + (2*r.re) + ' * s + ' + (r.re**2 + r.im**2) + ')'
            } else {
                term = '*(' + variable + '-' + r + ')'
            }
            console.log(term, r, r.re, r.im)
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
        num_loop = gain.toString() + '*' + num
    den_loop = den + ' + ' + num_loop
    tf_loop = num_loop + '/(' + den_loop + ')'
    return tf_loop
}

function get_root_locus(num, den, gain) {
    tf_loop_rat = math.format(get_system_tf(num, den, gain))
    
    tf_loop_rat_num = tf_loop_rat.split(' / ')[0]
    tf_loop_rat_den = tf_loop_rat.split(' / ')[1]

    return roots(get_poly_coeffs_from_string(tf_loop_rat_den))
}

num = build_polynomial_from_roots('s', '1', zeros)
den = build_polynomial_from_roots('s', '1', poles)

tf = num + '/(' + den + ')'
vals = []
freqs = get_magnitude('', 0, 2, 100)
freqs.forEach(f => {
    var num = math.evaluate('w*i', {w:2*math.pi*f})
    vals.push(math.evaluate(tf, {s:num}))
})

console.log(tf)
k = 40



vals_loop = []
vals.forEach((v, i) => {
    var num_i = math.evaluate('w*i', {w:2*math.pi*freqs[i]})
    // vals_loop.push(math.abs(math.evaluate(tf_loop, {s:num_i})))
    // console.log(num_i, math.evaluate('20*log10(abs(k*v/(1+k*v)))', {k:k, v:v}))
})


// den_coeffs = get_poly_coeffs_from_string(tf_loop_rat_den)
console.log(get_root_locus(num, den, 40))
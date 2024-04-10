/* references to elements */
var input_p = document.getElementById("input_p");
var input_q = document.getElementById("input_q");
var input_e = document.getElementById("input_e");
var input_text = document.getElementById("input_text");

var btn_genran = document.getElementById("btn_genran");
var btn_calculate = document.getElementById("btn_calculate");
var btn_endecrypt = document.getElementById("btn_endecrypt");
var radio_encrypt = document.getElementById("radio_encrypt");
var radio_decrypt = document.getElementById("radio_decrypt");

var lbl_input_text = document.getElementById("lbl_input_text");

var div_results = document.getElementById("div_results");
var div_endecrypt = document.getElementById("div_endecrypt");
var div_endecrypt_results = document.getElementById("div_endecrypt_results");


/* rsa components */
const hardcoded_primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];


/* keys used for encryption and decryption */
var key_n = 0;
var key_e = 0;
var key_d = 0;


/* returns whether p is a prime */
function is_prime(p) {
    if (p < 2) {
        return false;
    }
    for (let i = 2; i < p; i++) {
        if (p % i === 0) {
            return false;
        }
    }
    return true;
}


/* greatest common divisor */
function gcd(a, b) {
    if (b === 0) {
        return a;
    } else {
        return gcd(b, a % b);
    }
}


/* extended euclidean algorithm */
function eea(a, b) {
    let i = 1;
    let r0 = a;
    let r1 = b;
    let history = [];

    history.push({
        i: 0,
        r: r0,
        q: "-",
        s: 1,
        t: 0,
    });

    history.push({
        i: 1,
        r: r1,
        q: "-",
        s: 0,
        t: 1,
    });

    do {
        i++;
        let r = history[i-2].r % history[i-1].r;
        let q = (history[i-2].r - r) / history[i-1].r;
        let s = history[i-2].s - q * history[i-1].s;
        let t = history[i-2].t - q * history[i-1].t;

        history.push({
            i: i,
            r: r,
            q: q,
            s: s,
            t: t,
        });
    } while (history[i].r != 0)

    return history;
}


/* square and multiply algorithm: (x^e)%n */
function sam(x, e, n) {
    let history = [];
    let exp_history = "1";
    let tmp_e = e;
    let tmp_result = x;
    let tmp_result_nomod = 0;

    let digits = []
    while (tmp_e !== 0) {
        let digit = tmp_e % 2;
        digits.push(digit);
        tmp_e = tmp_e >> 1;
    }

    digits.pop();

    history.push({
        action: "",
        exponent: exp_history,
        value: x,
        value_mod: x % n,
    });

    for (let digit of digits.reverse()) {
        if (digit) {
            tmp_result = (tmp_result * tmp_result);
            tmp_result = (tmp_result * x);
            tmp_result_nomod = tmp_result;
            tmp_result = tmp_result % n;
            exp_history += "1";

            history.push({
                action: "SM",
                exponent: exp_history,
                value: tmp_result_nomod,
                value_mod: tmp_result,
            });
        } else {
            tmp_result = (tmp_result * tmp_result);
            tmp_result_nomod = tmp_result;
            tmp_result = tmp_result % n;
            exp_history += "0";

            history.push({
                action: "S",
                exponent: exp_history,
                value: tmp_result_nomod,
                value_mod: tmp_result,
            });
        }
    }

    return history;
}


/* app code */
btn_genran.onclick = function() {
    div_results.innerHTML = "";
    div_endecrypt.style.display = "none";
    div_endecrypt_results.innerHTML = "";
    key_n = 0; key_e = 0; key_d = 0;

    let possible_primes = hardcoded_primes.slice();  /* copy array */

    let p = possible_primes[Math.floor(Math.random() * possible_primes.length)];

    possible_primes.splice(possible_primes.indexOf(p), 1);  /* ensure p != q */
    
    let q = possible_primes[Math.floor(Math.random() * possible_primes.length)];

    let phi_n = (p - 1) * (q - 1);

    let e = 2;
    while (gcd(phi_n, e) != 1) {
        e += 1;
    }

    input_p.value = p;
    input_q.value = q;
    input_e.value = e;
};


btn_calculate.onclick = function() {
    div_endecrypt.style.display = "none";
    div_endecrypt_results.innerHTML = "";
    key_n = 0; key_e = 0; key_d = 0;

    let p = parseInt(input_p.value);
    let q = parseInt(input_q.value);
    let e = parseInt(input_e.value);

    if (isNaN(p) || isNaN(q) || isNaN(e)) {
        div_results.innerHTML += "<p style=\"color: red;\">Please enter valid numbers!</p>";
        return;
    }

    if (p === q) {
        div_results.innerHTML += "<p style=\"color: red;\">p and q need to be different!</p>";
        return;
    }

    if (e < 2) {
        div_results.innerHTML += "<p style=\"color: red;\">e needs to be greater than 0!</p>";
        return;
    }

    div_results.innerHTML = "";

    /* 1. Print the Primes */
    div_results.innerHTML += "<h3>1. Primes</h3>";
    let p_is_prime = is_prime(p);
    div_results.innerHTML += "<p>p = <b>" + p + "</b> " + (p_is_prime ? "&#9989;" : "&#10060;") + "</p>";
    let q_is_prime = is_prime(q);
    div_results.innerHTML += "<p>q = <b>" + q + "</b> " + (q_is_prime ? "&#9989;" : "&#10060;") + "</p>";

    if (!p_is_prime || !q_is_prime) {
        div_results.innerHTML += "<p style=\"color: red;\">p and q need to be prime!</p>";
        return;
    }

    /* 2. Calculate n */
    let n = p * q;
    div_results.innerHTML += "<h3>2. Calculate n</h3>";
    div_results.innerHTML += "n = p * q = " + p + " * " + q + " = <b>" + n + "</b></p>";

    /* 3. Calculate phi(n) */
    let phi_n = (p - 1) * (q - 1);
    div_results.innerHTML += "<h3>3. Calculate phi(n)</h3>";
    div_results.innerHTML += "<p>phi(n) = (p - 1) * (q - 1) = (" + p + " - 1) * (" + q + " - 1) = <b>" + phi_n + "</b></p>";

    /* 4/5. Check e and calculate d */
    let eea_history = eea(phi_n, e);
    let r0 = eea_history[0].r;
    let r1 = eea_history[1].r;
    let s = eea_history[eea_history.length - 2].s;
    let t = eea_history[eea_history.length - 2].t;
    let d = 0;
    let eea_gcd = s * r0 + t * r1;
    div_results.innerHTML += "<h3>4/5. Check e and calculate private number d</h3>";

    div_results.innerHTML += "<span>Calculate the greatest common divisor <i>gcd</i> and <i>d</i> using the Extended Euclidean Algorithm:</span>";
    let eea_table = "<table>";
    eea_table += "<tr><th>i</th><th>r</th><th>q<sub>i-1</sub></th><th>s</th><th>t</th></tr>";
    for (let line of eea_history) {
        eea_table += "<tr>";
        eea_table += "<td>" + line.i + "</td>";
        eea_table += "<td>" + line.r + "</td>";
        eea_table += "<td>" + line.q + "</td>";
        eea_table += "<td>" + line.s + "</td>";
        eea_table += "<td>" + line.t + "</td>";
        eea_table += "</tr>";
    }
    eea_table += "</table>";
    div_results.innerHTML += eea_table;

    div_results.innerHTML += "<p>gcd(phi(n), e) = s * r0 + t * r1 = s * phi(n) + d * e</p>";
    div_results.innerHTML += "<p>gcd(" + phi_n + ", " + e + ") = "
        + s + " * " + r0 + " + " + t + " * " + r1
        + " = <b>" + eea_gcd + "</b> " + (eea_gcd === 1 ? "&#9989;" : "&#10060;") + "</p>";

    if (eea_gcd !== 1) {
        div_results.innerHTML += "<p style=\"color: red;\">e is not valid! gcd(phi(n), e) needs to be 1.</p>";
        return;
    }

    d = t;

    while (d < 0) {
        d += phi_n;
    }
    div_results.innerHTML += "<p>d = <b>" + d + "</b></p>";

    /* 6. Print public and private key */
    div_results.innerHTML += "<h3>Print public and private key</h3>";
    div_results.innerHTML += "<p>Public key: (e, n) = (<b>" + e + "</b>, <b>" + n + "</b>)</p>";
    div_results.innerHTML += "<p>Private key: (d, n) = (<b>" + d + "</b>, <b>" + n + "</b>)</p>";

    div_endecrypt.style.display = "";
    key_n = n; key_e = e; key_d = d;
};


btn_endecrypt.onclick = function() {
    let text = parseInt(input_text.value);

    let n = key_n;
    let e = key_e;
    let d = key_d;

    if (isNaN(text)) {
        div_endecrypt_results.innerHTML = "<p style=\"color: red;\">Please enter a valid number!</p>";
        return;
    }

    if (n === 0 || e === 0 || d === 0) {
        div_endecrypt_results.innerHTML = "<p style=\"color: red;\">Please calculate the keys first!</p>";
        return;
    }

    if (text >= n) {
        div_endecrypt_results.innerHTML = "<p style=\"color: red;\">input needs to be smaller than n!</p>";
        return;
    }

    let do_encrypt = radio_encrypt.checked;
    
    /* Calculate Encryption */
    if (do_encrypt) {
        let x = text;

        div_endecrypt_results.innerHTML = "<h3>Encrypt x</h3>";

        div_endecrypt_results.innerHTML += "<p>y = x<sup>e</sup> mod n</p>";
        div_endecrypt_results.innerHTML += "<p>y = " + x + "<sup>" + e + "</sup> mod " + n + "</p>";

        let y_sam = sam(x, e, n);
        let y = y_sam[y_sam.length - 1].value_mod;

        div_endecrypt_results.innerHTML += "<span>Calculate using the Square-and-Multiply algorithm:</span>";
        let sam_table = "<table>";
        sam_table += "<tr><th>action</th><th>progress</th><th>value</th><th>value % " + n + "</th></tr>";
        for (let line of y_sam) {
            sam_table += "<tr>";
            sam_table += "<td>" + line.action + "</td>";
            sam_table += "<td>" + x + "<sup>" + line.exponent + "</sup></td>";
            sam_table += "<td>" + line.value + "</td>";
            sam_table += "<td>" + line.value_mod + "</td>";
            sam_table += "</tr>";
        }
        sam_table += "</table>";
        div_endecrypt_results.innerHTML += sam_table;

        div_endecrypt_results.innerHTML += "<p>y = " + x + "<sup>" + e + "</sup> mod " + n + " = " + y + "</p>";

        div_endecrypt_results.innerHTML += "<h3>Verify the encryption by decrypting again</h3>";

        let x2_sam = sam(y, d, n);
        let x2 = x2_sam[x2_sam.length - 1].value_mod;

        div_endecrypt_results.innerHTML += "<p>x = y<sup>d</sup> mod n</p>";
        div_endecrypt_results.innerHTML += "<p>x = " + y + "<sup>" + d + "</sup> mod " + n + " = " + x2 + "</p>";
    }

    /* Calculate Decryption */
    else {
        let y = text;

        div_endecrypt_results.innerHTML = "<h3>Decrypt y</h3>";

        div_endecrypt_results.innerHTML += "<p>x = y<sup>d</sup> mod n</p>";
        div_endecrypt_results.innerHTML += "<p>x = " + y + "<sup>" + d + "</sup> mod " + n + "</p>";

        let x_sam = sam(y, d, n);
        let x = x_sam[x_sam.length - 1].value_mod;

        div_endecrypt_results.innerHTML += "<span>Calculate using the Square-and-Multiply algorithm:</span>";
        let sam_table = "<table>";
        sam_table += "<tr><th>action</th><th>progress</th><th>value</th><th>value % " + n + "</th></tr>";
        for (let line of x_sam) {
            sam_table += "<tr>";
            sam_table += "<td>" + line.action + "</td>";
            sam_table += "<td>" + y + "<sup>" + line.exponent + "</sup></td>";
            sam_table += "<td>" + line.value + "</td>";
            sam_table += "<td>" + line.value_mod + "</td>";
            sam_table += "</tr>";
        }
        sam_table += "</table>";
        div_endecrypt_results.innerHTML += sam_table;

        div_endecrypt_results.innerHTML += "<p>x = " + y + "<sup>" + d + "</sup> mod " + n + " = " + x + "</p>";

        div_endecrypt_results.innerHTML += "<h3>Verify the decryption by encrypting again</h3>";

        let y2_sam = sam(x, e, n);
        let y2 = y2_sam[y2_sam.length - 1].value_mod;

        div_endecrypt_results.innerHTML += "<p>y = x<sup>e</sup> mod n</p>";
        div_endecrypt_results.innerHTML += "<p>y = " + x + "<sup>" + e + "</sup> mod " + n + " = " + y2 + "</p>";
    }
}


radio_encrypt.onclick = function() {
    lbl_input_text.innerHTML = "x = ";
}


radio_decrypt.onclick = function() {
    lbl_input_text.innerHTML = "y = ";
}


div_endecrypt.style.display = "none";

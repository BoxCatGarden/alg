/** An implementation in JS of Roger Stafford's 'randfixedsum' algorithm.
 * http://www.mathworks.com/matlabcentral/fileexchange/9700 */

const randInt = (min, maxEx) => {
    return Math.trunc(Math.random() * (maxEx - min)) + min;
};

function randperm(arr) {
    for (var i = 0, m = arr.length, k = m - 1; i < k; ++i) {
        var j = randInt(i, m),
            a = arr[i];
        arr[i] = arr[j];
        arr[j] = a;
    }
}

const max = (a, b) => (a >= b ? a : b);
const min = (a, b) => (a <= b ? a : b);

const K = (2 ** 53 - 1) * (2 ** 971); //2 ** 1023;
const P = 2 ** -1074;

/** randfixedsum algorithm.
 * @param n - number of tasks in each task set.
 * @param m - number of task sets.
 * @param s - the fixed sum of utilization of each task set.
 * @param a - minimum utilization of a task.
 * @param b - maximum utilization of a task.
 * @return - an Array containing 'm' generated task utilization packs, and each pack
 *     is an Array and has 'n' task utilization values in range [a,b]. */
function randfixedsum(n, m, s, a, b) {
    n = Math.trunc(n);
    m = Math.trunc(m);
    if (m <= 0) {
        return [];
    }
    if (n < 1) {
        var q = [];
        for (var i = 0; i < m; ++i) {
            q.push([]);
        }
        return q;
    }
    if (a >= b || s < n * a || n * b < s) {
        throw 'invalid input: a >= b or s < n*a or s > n*b.';
    }

    s = (s - n * a) / (b - a);

    s = max(min(s, n), 0);
    var k = Math.ceil(s) - 1;

    /* 'w' is an n by k+2 matrix.
    * 't' is an n-1 by k+1 matrix.
    * the matrix is stored in column and the construction loop
    * builds matrices column by column, and then row by row.
    * w(n,s) = w(n-1,s-1)*(n-s)/n + w(n-1,s)*s/n
    * w(n,s) only needs w(n-1,s-1) and w(n-1,s), which
    * are elements in its previous row and previous column.
    * with 'n' increases, the cache is accessed sequentially.
    * only elements on diagonal will be used, and 'w' is only used to
    * calculate 't', so both matrices are pruned.
    * 't'_p then is an n-k by k+1 matrix.
    * 'w'_p then is an n-k by k+1 matrix, and only one column is stored. */
    var t0 = [],
        t = [t0],
        nk = n - k;
    for (i = 0; i < nk; ++i) {
        t0.push(0);
    }
    if (k > 0) {
        var p1 = s - k, // (0,1]
            p2 = k + 1 - s, // [0,1)
            s2 = [p2],
            ww = K,
            w0 = [ww],
            ss = p1;
        for (i = 1; i < nk; ++i) {
            ww = (ww * ss) / (i + 1);
            w0.push(ww);
            s2.push(p2 + i);
        }
    }
    for (var j = 0; j < k; ++j) {
        var tj = [1],
            nj = 2 + j;
        ww = (w0[0] * s2[0]) / nj;
        w0[0] = ww;
        ss = p1 + 1 + j;
        for (i = 1; i < nk; ++i) {
            var ni = nj + i,
                ns = s2[i],
                tmp1 = (ww * ss) / ni,
                tmp2 = (w0[i] * ns) / ni;
            ww = tmp1 + tmp2;
            w0[i] = ww;
            var tmp3 = ww + P;
            tj.push(ns > ss ? (tmp2 / tmp3) : (1 - tmp1 / tmp3));
        }
        t.push(tj);
    }
    /* iterate for 'm' times and generate an 'x'
    * for each time.
    * the following implementation is a simple porting of
    * that in matlab by Stafford.
    * x = (1-a1)*p1 + a1*(1-a2)*p2 + ... + a1*a2*...*a_(n-1)*p_n
    * 'p' starts at p1(:)=s/n, and determines p(i) to be 1 or 0 for p_(i+1),
    * where i is from 1 to (n-1).
    * once p(i) is 1, the sum of p(i) of p_(i+1:n) is (a1*...*a_i)*1.
    * once p(i) is 0, the sum of p(i) of p_(i+1:n) is 0.
    * the probability for p(i) to be 1 is t(n-i,s_i)
    * (i.e., for w(n-i+1,s_i) to be w(n-i,s_i-1)).
    * if p(i) is 1, 's' is decreased by 1, so s_(i+1) = s_i - 1;
    * otherwise, s_(i+1) = s_i.
    * a_i = rand_i ^ (1/(n-i))
    * a_n = 0
    * p_i(i:n) = s_i/(n-i+1)
    * p_n(n) = s_n
    * x(j) =
    *     (1-a1)*s1/n + a1*(1-a2)*s2/(n-1) + ... + a1*...*(1-a_j)*s_j/(n-j+1)
    *   + a1*...*a_j*p_n(j),
    *     j in [1,n]
    *
    * p1    p2        p3       .. p_n
    * s1/n  e1        e1       .. e1
    * s1/n  s2/(n-1)  e2       .. e2
    * s1/n  s2/(n-1)  s3/(n-2) .. e3
    * .     .         .        .. .
    * s1/n  s2/(n-1)  s3/(n-2) .. s_n
    *
    *  */
    var vec = [],
        ba = b - a;
    for (var mi = 0; mi < m; ++mi) {
        var x = [],
            si = s,
            aa = 1,
            sum = 0;
        i = nk - 1;
        j = t.length - 1;
        for (ni = n - 1; ni > 0; --ni) {
            var r1 = Math.random(),
                r2 = Math.random(),
                ei = r1 < t[j][i] ? 1 : 0,
                ai = r2 ** (1 / ni);
            sum += (1 - ai) * aa * si / (ni + 1);
            aa *= ai;
            x.push((sum + aa * ei) * ba + a);
            si -= ei;
            j -= ei;
            i -= 1 - ei;
        }
        x.push((sum + aa * si) * ba + a);
        randperm(x);
        vec.push(x);
    }

    return vec;
}


module.exports = {randfixedsum};

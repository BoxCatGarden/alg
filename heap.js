/** prior(a, b) is true if and only if 'a' is prior to 'b'.
 * it can be assumed that 'a' and 'b' are not null
 * and ('a' !== 'b') always stands
 * when prior() is used by this heap structure.
 * @param a - node a. not null
 * @param b - node b. not null
 * @return - value indicating true or false */
function prior(a, b) {
    // for example
    return a.val < b.val;
}

/** 0 <= i <= ln, i < 2**30 */
function shift_up(li, prior, arr, i) {
    do {
        var j = (i - 1) >> 1;
        if (j !== -1 && prior(li, arr[j])) {
            (arr[i] = arr[j])._lh_idx = i;
            i = j;
            continue;
        }
        (arr[i] = li)._lh_idx = i;
        return;
    } while (true);
}

/** 0 <= i <= ln, i < 2**30 */
function shift_down(li, prior, arr, i, ln) {
    do {
        var j = (i << 1) + 1;
        if (j < ln) {
            var k = j + 1;
            if (k < ln && prior(arr[k], arr[j])) {
                j = k;
            }
            if (prior(arr[j], li)) {
                (arr[i] = arr[j])._lh_idx = i;
                i = j;
                continue;
            }
        }
        (arr[i] = li)._lh_idx = i;
        return;
    } while (true);
}

/** array-based heap <br/>
 * top index: 0 <br/>
 * arr[0] is the top node if heap is not empty.
 * no guarantee on the value of arr[0] if empty. <br/>
 * priority rule: <br/>
 * the node (element) with the highest priority among all nodes in the heap
 * will at the top of the heap.
 * the order of nodes that have the same priority has no guarantee.
 * more detailed,
 * with node A and B, if prior(A, B) is true, then A has higher priority;
 * or, if false, it can be lower than or equal to B's priority.
 * if A and B both have the highest priority, which one to be the top has
 * no guarantee. either of them can be the top.
 * however, to enqueue or remove a node with the same priority as the top node's
 * will not replace the top node unless it is the top node itself.
 * @param prior - priority comparator
 * @param arr - heap array. no duplication, not null.
 *     arr[i] (i < ln): must not in any heap, not null
 * @param ln - length, the number of nodes in the heap-array. ln >= 0, ln <= 2**30 */
function heapify(prior, arr, ln) {
    var q = (ln >> 1) - 1;
    for (var i = q + 1; i < ln; ++i) {
        arr[i]._lh_idx = i;
    }
    while (q !== -1) {
        shift_down(arr[q], prior, arr, q, ln);
        --q;
    }
}

/** add node into heap and return the updated ln.
 * @param node - node to enqueue. must not in any heap, not null
 * @param prior - priority comparator
 * @param arr - heap array. not null
 * @param ln - number of nodes. ln >= 0, ln <= 2**30 - 1
 * @return - updated ln */
function enqueue(node, prior, arr, ln) {
    shift_up(node, prior, arr, ln);
    return ln + 1;
}

/** remove the top node from heap and return the updated ln. <br/>
 * on removing, it does not decrease the length of heap-array,
 * but just set the last element null,
 * and decrease the number of nodes (ln) by one.
 * @param prior - priority comparator
 * @param arr - heap array. not null
 * @param ln - number of nodes. ln >= 1, ln <= 2**30
 * @return - updated ln */
function dequeue(prior, arr, ln) {
    --ln;
    var node = arr[0];
    shift_down(arr[ln], prior, arr, 0, ln);
    // release the reference
    arr[ln] = null;
    node._lh_idx = -1;
    return ln;
}

/** remove node from heap and return the updated ln. <br/>
 * on removing, decrease ln by one and length of heap array
 * won't change.
 * @param node - node to remove. must in heap, not null
 * @param prior - priority comparator
 * @param arr - heap array. not null
 * @param ln - number of nodes. ln >= 1, ln <= 2**30
 * @return - updated ln */
function remove(node, prior, arr, ln) {
    --ln;
    var i = node._lh_idx;
    node._lh_idx = -1;
    var li = arr[ln];
    // release the reference
    arr[ln] = null;
    if (node !== li) {
        if (prior(node, li)) {
            shift_down(li, prior, arr, i, ln);
        } else {
            shift_up(li, prior, arr, i);
        }
    }
    return ln;
}

/** initialize a node. not necessary unless to avoid any
 * accessing to its prototype for non-existent properties.
 * @param node - must not in any heap, not null */
function init_node(node) {
    node._lh_idx = -1;
}

/** return true if and only if node is not in any heap.
 * @param node - not null
 * @return - boolean */
function not_in_heap(node) {
    return node._lh_idx === -1 || node._lh_idx === undefined;
}


module.exports = {
    prior, init_node, heapify, enqueue, dequeue, remove, not_in_heap
};

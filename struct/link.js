/** A simple cyclic linked list. */

/** initialize a list with node as its first added element.
 * i.e., to create a list, just init() a node and that node
 * is the list itself (the only one node in that list).
 * @param node - a node not in any list. */
function init(node) {
    node._l_prev = node._l_next = node;
}

/** insert node into a list, just before the next_node,
 * where node !== next_node. <br/>
 * @param node - a node not in any list.
 * @param next_node - a node already in the target list. */
function insert_before(node, next_node) {
    next_node._l_prev =
        (node._l_prev = (node._l_next = next_node)._l_prev)._l_next =
            node;
    /* For the hope of register cache, the result of assignment
    * is used. <br/>
    * To obey the rule of 'sequence point', if a change happens on
    * the value of a variable (i.e., an address) BEFORE the assignment happens, it should
    * only occur once, or the result can be unexpected. Other binary
    * operators are also like it. <br/>
    * EXAMPLE: <br/>
    * 1. "i = i + 1;" is a good one. The change of i happens when and only
    *    when the assignment happens. <br/>
    * 2. "j = (++i) + i;" is a bad one. A read of i occurs on the right side of
    *    ++i. If ++i first, then j is (2 * (i + 1)), or j is (2 * i + 1). <br/>
    * 3. "(a = {}).b = a;" (where a is {q: 3} before) is a bad one. If the right side first,
    *    then a is {b:{q:3}}, or a is {b:a}.
    * 4. "(arr[i++])[i++] = 1;" is a bad one.
    * 5. "(++i) && (++i)" is a good one because of the short-circuit execution. */
}

/** insert node just after prev_node.
 * @see insert_before */
function insert_after(node, prev_node) {
    prev_node._l_next =
        (node._l_next = (node._l_prev = prev_node)._l_next)._l_prev =
            node;
}

/** remove node from its current list.
 * @param node - a node in some list. */
function remove(node) {
    (node._l_prev._l_next = node._l_next)._l_prev = node._l_prev;
    // release references
    node._l_prev = node._l_next = null;
}

/** return true if and only if node is not in any list.
 * @param node - not null
 * @return - boolean */
function not_in_list(node) {
    return !node._l_prev;
}

/** initialize node. just set all the properties NULL.
 * it is not necessary unless to avoid any accessing to
 * the node's prototype for non-existent properties.
 * @param node - a node not in any list. */
function init_node(node) {
    node._l_prev = node._l_next = null;
}


module.exports = {
    init, init_node, insert_before, insert_after, remove, not_in_list
};

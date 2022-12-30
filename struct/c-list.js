var {
    prior: priord,
    init: init0,
    init_node: init_node0, rb_add, rb_remove, not_in_tree
} = require('./tree.js');
var {init, init_node, insert_before, insert_after, remove, not_in_list} = require('./link.js');

/** a priority list based on red-black tree. <br/>
 * priority rule: <br/>
 * priority-descending last-added-time-ascending order. a node will be previous to those which have
 * a priority lower than its priority. a node will be previous to those which have
 * a priority equal to its priority but are added later than it. if a node is removed, then it's
 * no longer in the list. when it's added again, it is added at THAT time (the last added-time). <br/>
 * e.g., the first node of a list is the one with the highest priority among all nodes in the list.
 * if there are several nodes having the highest priority, it is the one added earliest
 * among them. <br/>
 * if and only if prior(A, B) is ture, node A has a higher priority than node B.
 *
 * base structure: link, tree
 * @see constructor */
class TreeList {
    /**
     * @param prior - prior(a, b). priority comparator.
     *     prior(a, b) should be true if and only if 'a' is prior to 'b'.
     *     input 'a' and 'b' will not be null. ('a' !== 'b') will always stand.
     *     prior() should return a value indicating true or false. */
    constructor(prior) {
        this.prior = prior ?? priord;
        this.tRoot = null;
        var head = {};
        init_node0(head);
        init_node(head);
        head.val = 0;
        init(head);
        this.lHead = head;
        this.ln = 0;
    }

    /** @return - max safe number of nodes in this list.
     *     it may lead to unexpected behaviors to have nodes more than this number. */
    get MAX_SAFE_SIZE() {
        return Number.MAX_SAFE_INTEGER;
    }

    /** initialize node, not necessary unless to avoid any accessing to
     * the node's prototype for non-existent node-properties.
     * @param node - must NOT in any base structure, not null */
    static initNode(node) {
        init_node0(node);
        init_node(node);
    }

    /** make a node, initialize and return it.
     * 'val' will be stored in property node.val.
     * @param val - value stored in node.
     *     if omitted, node.val will be defined and assigned with 'undefined'.
     *     optional
     * @return - the made node */
    static makeNode(val) {
        var node = {};
        init_node0(node);
        init_node(node);
        node.val = val;
        return node;
    }

    /** @see TreeList.initNode */
    initNode(node) {
        TreeList.initNode(node);
    }

    /** @see TreeList.makeNode */
    makeNode(val) {
        return TreeList.makeNode(val);
    }

    /** @param node - must NOT in any base structure, not null */
    add(node) {
        var root = this.tRoot;
        if (root) {
            root = rb_add(node, this.prior, root);
            if (node._lt_rch) {
                insert_before(node, node._lt_rch);
            } else {
                var lp = node._lt_par;
                if (lp._lt_rch === node) {
                    insert_after(node, lp);
                } else {
                    insert_before(node, lp);
                }
            }
        } else {
            init0(node);
            root = node;
            insert_after(node, this.lHead);
        }
        this.tRoot = root;
        ++this.ln;
    }

    /** @param node - must in this list, not null */
    remove(node) {
        this.tRoot = rb_remove(node, this.tRoot, node._l_prev);
        remove(node);
        --this.ln;
    }

    /** from first to last.
     * @param operator - operator(node). return true to break the loop.
     *     'node' can be removed safely from this list in operator(node).
     *     node added by operator() may or may not be retrieved during
     *     the current .forEach(). */
    forEach(operator) {
        var head = this.lHead,
            cur = head._l_next;
        while (cur !== head) {
            var node = cur;
            cur = cur._l_next;
            if (operator(node)) {
                return;
            }
        }
    }

    /** from first to last.
     * the current node can be removed safely from this list.
     * node added during iteration may or may not be retrieved
     * by the current iteration. */
    * [Symbol.iterator]() {
        var head = this.lHead,
            cur = head._l_next;
        while (cur !== head) {
            var node = cur;
            cur = cur._l_next;
            yield node;
        }
    }

    /** get the first node in this list.
     * @return - first node in this list. 'null' if no node */
    first() {
        var head = this.lHead,
            node = head._l_next;
        return node !== head ? node : null;
    }

    /** get the next node of 'node'.
     * @param node - must in this list, not null
     * @return - next node of this 'node'. 'null' if no next node */
    next(node) {
        var next = node._l_next;
        return next !== this.lHead ? next : null;
    }

    /** get the last node in this list.
     * @return - last node in this list. 'null' if no node */
    last() {
        var head = this.lHead,
            node = head._l_prev;
        return node !== head ? node : null;
    }

    /** get the previous node of 'node'.
     * @param node - must in this list, not null
     * @return - previous node of this 'node'. 'null' if no previous node */
    prev(node) {
        var prev = node._l_prev;
        return prev !== this.lHead ? prev : null;
    }

    /** @return - number of nodes in this list. */
    get size() {
        return this.ln;
    }

    /** return true if and only if node is in this list.
     * @param node - not null
     * @return - boolean */
    has(node) {
        if (not_in_list(node) || not_in_tree(node)) {
            return false;
        }
        var cur = this.tRoot,
            prior = this.prior;
        while (cur) {
            if (cur === node) {
                return true;
            }
            cur = prior(node, cur) ? cur._lt_lch : cur._lt_rch;
        }
        var head = this.lHead;
        cur = head._l_next;
        while (cur !== head) {
            if (cur === node) {
                return true;
            }
            cur = cur._l_next;
        }
        return false;
    }

    /** return true if and only if node is in this list,
     * when every node in this list has a unique priority
     * (i.e., a different priority to each other).
     * when some nodes, in this list, have the same priority,
     * use .has() instead.
     * @param node - not null
     * @return - boolean
     * @see has */
    uniHas(node) {
        if (not_in_list(node) || not_in_tree(node)) {
            return false;
        }
        var cur = this.tRoot,
            prior = this.prior;
        while (cur) {
            if (cur === node) {
                return true;
            }
            cur = prior(node, cur) ? cur._lt_lch : cur._lt_rch;
        }
        return false;
    }

    /** return true if and only if node is NOT in any base structure.
     * @param node - not null
     * @return - boolean */
    canHave(node) {
        return not_in_list(node) && not_in_tree(node);
    }
}


module.exports = {TreeList};

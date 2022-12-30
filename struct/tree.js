/** prior(a, b) is true if and only if 'a' is prior to 'b'.
 * it can be assumed that 'a' and 'b' are not null
 * and ('a' !== 'b') always stands
 * when prior() is used by this tree structure.
 * @param a - node a. not null
 * @param b - node b. not null
 * @return - value indicating true or false */
function prior(a, b) {
    // for example
    return a.val < b.val;
}

/** initialize a node, defining all its properties with NULL.
 * it is not necessary to initialize a node unless to avoid any accessing
 * to the node's prototype for non-existent properties.
 * @param node - the node to be initialized. must NOT in any tree, not null */
function init_node(node) {
    /* the original purpose is to clean_up node */
    // release references
    node._lt_par = null;
    node._lt_lch = null;
    node._lt_rch = null;
    // 0: red, 1: black
    node._lt_color = 0;
}

// an alias of init_node
const clean_up = init_node;

// node !== par_node unless null
const bind_left = (node, par_node) => {
    node && (node._lt_par = par_node);
    par_node && (par_node._lt_lch = node);
};
// node !== par_node unless null
const bind_right = (node, par_node) => {
    node && (node._lt_par = par_node);
    par_node && (par_node._lt_rch = node);
};
// node !== target_par unless null. target is NOT null.
const bind_replace = (node, target, target_par) => {
    node && (node._lt_par = target_par);
    if (target_par) {
        if (target_par._lt_lch === target) {
            target_par._lt_lch = node;
        } else {
            target_par._lt_rch = node;
        }
    }
};

// node must have left child
function rotate_right(node) {
    var ll = node._lt_lch,
        lp = node._lt_par;
    bind_left(ll._lt_rch, node);
    bind_right(node, ll);
    bind_replace(ll, node, lp);
}

//node must have right child
function rotate_left(node) {
    var lr = node._lt_rch,
        lp = node._lt_par;
    bind_right(lr._lt_lch, node);
    bind_left(node, lr);
    bind_replace(lr, node, lp);
}

// node must have left child and parent, and is the right child
function rotate_right_left(node) {
    var ll = node._lt_lch,
        lp = node._lt_par,
        lpp = lp._lt_par;
    bind_left(ll._lt_rch, node);
    bind_right(node, ll);
    bind_right(ll._lt_lch, lp);
    bind_left(lp, ll);
    bind_replace(ll, lp, lpp);
}

// node must have right child and parent, and is the left child
function rotate_left_right(node) {
    var lr = node._lt_rch,
        lp = node._lt_par,
        lpp = lp._lt_par;
    bind_right(lr._lt_lch, node);
    bind_left(node, lr);
    bind_left(lr._lt_rch, lp);
    bind_right(lp, lr);
    bind_replace(lr, lp, lpp);
}

/** add node into tree <br/>
 * priority rule: <br/>
 * with a given root A (of the tree or a subtree) and the to-be-added node B,
 * if B is prior to A, then B is added to the left subtree of A;
 * or, if NOT prior, then right
 * @param node - node to add. must NOT in any tree, not null
 * @param prior - priority comparator
 * @param root - root of tree. must in tree, not null */
function add(node, prior, root) {
    var lp;
    do {
        var br = prior(node, root) ? '_lt_lch' : '_lt_rch';
        root = (lp = root)[br];
    } while (root);
    node._lt_par = lp;
    lp[br] = node;
}

/** add node into rb-tree, and return the updated root
 * @return - updated root
 * @see add */
function rb_add(node, prior, root) {
    add(node, prior, root);

    do {
        var lp = node._lt_par;
        if (lp._lt_color) {
            return root;
        }

        var lpp = lp._lt_par,
            la = lpp._lt_rch !== lp ? lpp._lt_rch : lpp._lt_lch;
        if (la && !la._lt_color) {
            la._lt_color = 1;
            lp._lt_color = 1;
            if (lpp !== root) {
                lpp._lt_color = 0;
                node = lpp;
            } else {
                return root;
            }
        } else {
            break;
        }
    } while (true);

    lpp._lt_color = 0;
    if (lpp._lt_rch === lp) {
        if (lp._lt_rch === node) {
            la = lp;
            rotate_left(lpp);
        } else {
            la = node;
            rotate_right_left(lp);
        }
    } else {
        if (lp._lt_rch === node) {
            la = node;
            rotate_left_right(lp);
        } else {
            la = lp;
            rotate_right(lpp);
        }
    }
    la._lt_color = 1;

    if (lpp !== root) {
        return root;
    }
    return la;
}

// node must have left child
function get_lmax(node) {
    var cur = node._lt_lch;
    do {
        cur = (node = cur)._lt_rch;
    } while (cur);
    return node;
}

/** get the target to move
 * @param node - node to be removed. not null
 * @param lmax_cache - can be null
 * @see move_target */
function get_target(node, lmax_cache) {
    if (node._lt_lch && node._lt_rch) {
        return lmax_cache ?? get_lmax(node);
    }
    return node;
}

/** take target from its original place, move it to the place of node,
 * and then replace and remove node.
 * it is equivalent to exchanging the places (in the tree) between node and target,
 * and then removing node.
 * @param target - target to move. not null, num(child) <= 1
 * @param node - node to be removed. not null
 * @param root - not null
 * @return - updated root, strict null if empty
 * @see get_target */
function move_target(target, node, root) {
    var lch = target._lt_lch ?? target._lt_rch;
    bind_replace(lch, target, target._lt_par);
    if (target !== node) {
        bind_left(node._lt_lch, target);
        bind_right(node._lt_rch, target);
        bind_replace(target, node, node._lt_par);
        target._lt_color = node._lt_color;
    }
    clean_up(node);
    if (node !== root) {
        return root;
    }
    if (target !== node) {
        return target;
    }
    if (lch) {
        lch._lt_color = 1;
        return lch;
    }
    return null;
}

/** remove node from tree, and return the updated root
 * @param node - node to remove. must in tree, not null
 * @param root - root of tree. must in tree, not null
 * @param lmax_cache - left max node of 'node'. optional, can be null
 * @return - updated root, strict null if empty */
function remove(node, root, lmax_cache) {
    var target = get_target(node, lmax_cache);
    return move_target(target, node, root);
}

/** remove node from rb-tree, and return the updated root
 * @see remove */
function rb_remove(node, root, lmax_cache) {
    var target = get_target(node, lmax_cache);

    if (target._lt_color) {
        var lch = target._lt_lch ?? target._lt_rch;
        if (lch) {
            lch._lt_color = 1;
            return move_target(target, node, root);
        }

        lch = target;
        do {
            var lp = lch._lt_par;
            if (lp) {
                var la = lp._lt_rch !== lch ? lp._lt_rch : lp._lt_lch;
                if (lp._lt_color && la._lt_color &&
                    (!la._lt_lch || la._lt_lch._lt_color) &&
                    (!la._lt_rch || la._lt_rch._lt_color)) {
                    la._lt_color = 0;
                    lch = lp;
                } else {
                    break;
                }
            } else {
                return move_target(target, node, root);
            }
        } while (true);

        if (!la._lt_color) {
            la._lt_color = 1;
            lp._lt_color = 0;
            if (lp === root) {
                root = la;
            }
            if (lp._lt_rch === la) {
                rotate_left(lp);
                la = lp._lt_rch;
            } else {
                rotate_right(lp);
                la = lp._lt_lch;
            }
        }

        lch = null;
        if (lp._lt_rch === la) {
            if (la._lt_rch && !la._lt_rch._lt_color) {
                lch = la;
                la._lt_rch._lt_color = 1;
                rotate_left(lp);
            } else if (la._lt_lch && !la._lt_lch._lt_color) {
                lch = la._lt_lch;
                rotate_right_left(la);
            }
        } else {
            if (la._lt_lch && !la._lt_lch._lt_color) {
                lch = la;
                la._lt_lch._lt_color = 1;
                rotate_right(lp);
            } else if (la._lt_rch && !la._lt_rch._lt_color) {
                lch = la._lt_rch;
                rotate_left_right(la);
            }
        }
        if (lch) {
            lch._lt_color = lp._lt_color;
            if (lp === root) {
                root = lch;
            }
        } else {
            la._lt_color = 0;
        }
        lp._lt_color = 1;
    }

    return move_target(target, node, root);
}

/** initialize a tree. i.e., create a tree with only one node, root,
 * and 'node' is that root. it will change 'node' into the root.
 * @param node - node to be a root. must NOT in any tree, not null */
function init(node) {
    node._lt_color = 1;
}

/** return true if and only if node is NOT in any tree
 * @param node - not null
 * @return - boolean */
function not_in_tree(node) {
    return !(node._lt_par ?? node._lt_color);
}


module.exports = {
    prior, init, init_node, add, remove, rb_add, rb_remove, not_in_tree
};
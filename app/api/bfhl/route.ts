import { NextResponse } from 'next/server';

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new NextResponse(null, { status: 200, headers });
}

export async function GET() {
  return NextResponse.json({ operation_code: 1, message: "Use a POST request with the 'data' array to use this API!" }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.data)) {
      return NextResponse.json({ error: "Invalid JSON. 'data' must be an array of strings." }, { status: 400 });
    }

    const data: string[] = body.data;

    const invalid_entries: string[] = [];
    const duplicate_edges_set = new Set<string>();

    const valid_edges: { parent: string; child: string; original: string }[] = [];
    const edge_seen = new Set<string>();
    const child_parent_map = new Map<string, string>();


    for (const item of data) {
      const original = typeof item === 'string' ? item : JSON.stringify(item);
      const trimmed = typeof item === 'string' ? item.trim() : '';
      const match = trimmed.match(/^([A-Z])->([A-Z])$/);

      if (!match || match[1] === match[2]) {
        invalid_entries.push(original);
        continue;
      }

      const parent = match[1];
      const child = match[2];
      const edgeKey = `${parent}->${child}`;

      if (edge_seen.has(edgeKey)) {
        duplicate_edges_set.add(edgeKey);
        continue;
      }
      edge_seen.add(edgeKey);

      if (child_parent_map.has(child)) {
        continue; 
      }
      child_parent_map.set(child, parent);
      valid_edges.push({ parent, child, original: edgeKey });
    }


    const adj_undir = new Map<string, string[]>();
    const all_nodes = new Set<string>();
    for (const e of valid_edges) {
      all_nodes.add(e.parent);
      all_nodes.add(e.child);
      if (!adj_undir.has(e.parent)) adj_undir.set(e.parent, []);
      adj_undir.get(e.parent)!.push(e.child);
      if (!adj_undir.has(e.child)) adj_undir.set(e.child, []);
      adj_undir.get(e.child)!.push(e.parent);
    }

    const components: Set<string>[] = [];
    const visited_nodes = new Set<string>();
    for (const node of all_nodes) {
      if (!visited_nodes.has(node)) {
        const comp = new Set<string>();
        const q = [node];
        visited_nodes.add(node);
        while (q.length > 0) {
          const curr = q.shift()!;
          comp.add(curr);
          const neighbors = adj_undir.get(curr) || [];
          for (const n of neighbors) {
            if (!visited_nodes.has(n)) {
              visited_nodes.add(n);
              q.push(n);
            }
          }
        }
        components.push(comp);
      }
    }


    const adj_dir = new Map<string, string[]>();
    for (const e of valid_edges) {
      if (!adj_dir.has(e.parent)) adj_dir.set(e.parent, []);
      adj_dir.get(e.parent)!.push(e.child);
      if (!adj_dir.has(e.child)) adj_dir.set(e.child, []); 
    }

    const hierarchies: any[] = [];

    for (const comp of components) {

      const roots: string[] = [];
      for (const n of comp) {
        if (!child_parent_map.has(n)) roots.push(n);
      }

      if (roots.length === 0) {
        const root = Array.from(comp).sort()[0];
        hierarchies.push({
          root,
          tree: {},
          has_cycle: true
        });
      } else {

        const root = roots[0];

        function dfs(n: string): { depth: number, tree: any } {
          const children = adj_dir.get(n) || [];
          children.sort(); 

          const treeObj: any = {};
          let maxChildDepth = 0;

          for (const child of children) {
            const { depth: cd, tree: ct } = dfs(child);
            treeObj[child] = ct;
            maxChildDepth = Math.max(maxChildDepth, cd);
          }

          return { depth: maxChildDepth + 1, tree: treeObj };
        }

        const { depth, tree } = dfs(root);

        hierarchies.push({
          root,
          tree: { [root]: tree },
          depth
        });
      }
    }

    hierarchies.sort((a, b) => a.root.localeCompare(b.root));


    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root: string | null = null;
    let maxD = -1;

    for (const h of hierarchies) {
      if (h.has_cycle) {
        total_cycles++;
      } else {
        total_trees++;
        if (h.depth > maxD) {
          maxD = h.depth;
          largest_tree_root = h.root;
        } else if (h.depth === maxD) {
          if (largest_tree_root === null || h.root < largest_tree_root) {
            largest_tree_root = h.root;
          }
        }
      }
    }


    const responseData = {
      user_id: process.env.USER_FULLNAME && process.env.USER_DOB ? `${process.env.USER_FULLNAME}_${process.env.USER_DOB}` : "neveshdivya_01102005",
      email_id: process.env.USER_EMAIL || "nd7621@srmist.edu.in",
      college_roll_number: process.env.USER_ROLL_NUMBER || "RA2311031010007",
      hierarchies,
      invalid_entries,
      duplicate_edges: Array.from(duplicate_edges_set),
      summary: {
        total_trees,
        total_cycles,
        largest_tree_root: largest_tree_root === null ? "" : largest_tree_root
      }
    };

    const response = NextResponse.json(responseData, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

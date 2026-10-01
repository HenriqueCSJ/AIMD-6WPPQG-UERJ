# Local lifecycle patch — 2026-10-01

Base: **3Dmol.js 2.5.5**, retained from the distribution identified in `README.md`. The original license remains in `3Dmol-LICENSE.txt`. This is a local patch, not an upstream version update.

Repeated trajectory frames replace molecular render groups. The original `GLModel.globj` removed the previous group without disposing its child geometries and materials; `GLModel.removegl` and `GLShape.removegl` inspected only the enclosing group, which does not own those child resources. A real browser baseline showed geometry counters increasing with each frame.

The patch adds a recursive release helper, with per-call sets so a resource shared by cloned children is released once. It is called when a molecular render group is replaced or removed, and when a shape is removed. Shape redraws release only their old materials: the shape's geometry is reused and must remain alive. Volumetric rendering is outside this patch.

The geometry deallocator also releases the radius and instancing-offset buffers already allocated by the renderer, in addition to its original vertex, color, normal, face and line buffers. These extra buffers are relevant to sphere impostors and instanced geometry.

Large shapes can be split into multiple geometry groups. The original renderer incremented its memory counter per allocated group but decremented only once per enclosing geometry; this made dense systems appear to retain one additional geometry per frame even after every buffer was deleted. Disposal now subtracts the number of groups actually released, clears the deleted buffer handles, and ignores repeated disposal of an already released geometry. The test tracks actual buffer allocation/deletion as well as the counter, including a three-group geometry and subsequent reuse.

Label batching, persistence and explicit disposal are handled by the application's rendering code; `removeAllLabels` itself is unchanged in this bundle.

`GLShape.addDashedCylinders(specs)` is a local batch method. It invokes the same dashed-cylinder primitive and preserves its coordinates, radius, colors, caps, normals and faces. Bounds calculation is deferred until all contacts are added, then scans every vertex of every geometry group once. Calling `addDashedCylinder(spec)` individually retains its original behavior. The application calls `finalize()` after the batch. This avoids repeatedly scanning the growing contact mesh, without substituting chemical atoms or changing the dash pattern. A test compares every mesh array against the original per-contact calls across multiple geometry groups and independently checks the final bounding box and sphere.

`tests/vendor-lifecycle.test.cjs` exercises the actual bundled model/shape implementations and shared-resource cleanup. It also checks coordinate refresh/picking state and the missing buffer-release paths. The test harness omits only the unrelated surface-worker bootstrap, which needs browser globals. Live WebGL counter checks remain a separate application-level verification.

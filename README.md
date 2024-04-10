# 2d-geometry

**2d-geometry** is a fork of [flatten-js](https://github.com/alexbol99/flatten-js) focused on performance, ergonomics and Typescript.

This library is meant to be a complete solution for manipulating abstract geometrical shapes like point, vector and circles. It also provides a lot of useful methods and algorithms like finding intersections, checking inclusion, calculating distance, applying affine transformations, performing boolean operations and more.

### Why fork?

The original library is **great** from a feature-set and mathematical point of view, but Typescript support is mediocre, and some very useful primitives are not available. This library adds the very needed `Quadratic`, `Bezier` and `Path` (sequence of `Arc`, `Segment`, `Quadratic` and `Bezier`), which make working with SVG and Canvas a breeze.

The original is also written in a way that's hard to optimize for JS engines, and impossible to tree-shake for bundlers. This fork will break API with a new major at some point to split some features (notably intersection & distance algorithms) and optimize bundle size.

## Installation

```
pnpm install --save 2d-geometry
```

## Usage

```javascript
import {
    Point,
    Vector,      // Oriented vector starting at (0, 0)
    Line,        // Infinite line
    Ray,         // Semi-infinite line (starts at a point, doesn't end)
    Segment,     // Finite line (starts and ends at a point)
    Arc,         // Circular arc only, no ellipses
    Circle,
    Box,         // A bounding box, not a Rect!
    Bezier,      // Cubic bezier
    Quadratic,   // Quadratic bezier
    Path,        // Sequence of Arc, Segment, Quadratic and Bezier
    Polygon,
    Rect,        // Child class of Polygon
    RoundedRect, // Child class of Polygon
    Matrix,      // 2d affine transformation matrix
} from '2d-geometry';
```

Every shape is a child class of the abstract `Shape` class, which contains props like `.box` and `.center`, and methods like `.translate()` or `.rotate()`.

Some classes have shortcuts to avoid calling with `new`, for example:
```javascript
import { point, circle, segment } from '2d-geometry';

const s1 = segment(10, 10, 200, 200);
const s2 = segment(10, 160, 200, 30);
const c = circle(point(200, 110), 50);
```

The objects are immutable by default, and create new copies of their content:
```javascript
import { Point } from '2d-geometry';

const a = Point.EMPTY // contains a frozen `new Point(0, 0)`
const b = a.translate(50, 100)
```

Some methods have mutable equivalents however, for high-performance cases where avoiding allocations is desirable. They will be marked with the `Mut` suffix:
```javascript
import { Matrix } from '2d-geometry';

const a = new Matrix()
const b = Matrix.fromTransform(0, 0, 0, 2) // x, y, rotation, scale
a.multiplyMut(b) // a is mutated directly
```

The core library is abstract, but some SVG utils are exported separately (to avoid the bundle size cost). You may use them as such:
```javascript
import { Circle } from '2d-geometry'
import { parsePath, stringify } from '2d-geometry/svg'

const svgString = stringify(new Circle(100, 100, 50), { fill: 'red' })
const path = parsePath('M0,0 L100,0 L100,100 L0,100 Z') // returns a `Path` instance
```

This project adheres to the [Tau manifesto](https://tauday.com/tau-manifesto) and exports the circle constant as `TAU`, which is equivalent to `2 * Math.PI`:
```javascript
import { TAU } from '2d-geometry'
```

## High-performance use-cases

If you're rendering with this library, you may need to match on the type of object. You may use the `shape.tag` discriminant for that, which is an integer enum.

```javascript
import { ShapeTag, Segment, Circle } from '2d-geometry'

const shape = graphicNode.shape

// NO
if (shape instanceof Segment) {
  drawSegment(shape as Segment)
} else if (shape instanceof Circle) {
  drawCircle(shape as Circle)
}
// ...

// YES
switch (shape.tag) {
  case ShapeTag.Segment: {
    drawSegment(shape as Segment); break
  }
  case ShapeTag.Circle: {
    drawCircle(shape as Circle); break
  }
  // ...
}
```

You can also use the `shape._data` field for your own purposes, for examples caching rendered data.

## Content of the library

### Polygon

[Polygon](https://alexbol99.github.io/2d-geometry/Polygon.html) in **2d-geometry** library is actually a multi-polygon.
Polygon is a collection of faces - 
closed oriented chains of edges, which may be of type Segment or Arc. The most external face
called island, a face included into it is called hole. Holes in turn may have inner islands,
number of inclusion levels is unlimited.
 
Orientation of islands and holes is matter for calculation
of relationships and boolean operations, holes should have orientation opposite to islands.
It means that for proper results faces in a polygon should be **orientable**: they should not have self-intersections.
Faces also should not overlap each other. Method ```isValid()``` checks if polygon fit these rules.

Constructor of the polygon object accept various inputs:
* Array of shapes (instances of Flatten.Segment or Flatten.Arc) that represent closed chains
* Array of shapes as json objects that represent closed chains 
* Array of points (Flatten.Point) that represent vertices of the polygon
* Array of numeric pairs [x,y] that represent vertices of the polygon
* Instances of Circle or Box

Polygon provides various useful methods:
* ```area``` - calculate area of a polygon
* ```addFace``` - add a new face to polygon
* ```deleteFace``` - removes face from polygon
* ```addVertex``` - split an edge of polygon adn create new vertex
* ```cut``` - cut polygon with multiline into sub-polygons
* ```findEdgeByPoint``` - find edge in polygon
* ```contains``` - test if polygon contains shape (point, segment or arc)
* ```transform``` - transform polygon using affine transformation matrix
* ```reverse``` - revert orientation of faces
* ````splitToIslands```` - split to array of islands with holes

### Multiline

Multiline represent an unclosed chain of edges of type Segment or Arc

### Planar Set

Planar Set is a container of shapes that enables spatial seach by rectangular query.

### Transformations

All the classes have methods ```translate```, ```rotate``` and ```scale``` 
which may be chained. 
<br/>Example:
```javascript
// Rotate segment by 45 deg around its center
let {point,segment,matrix} = Flatten;
let s = segment(point(20,30), point(60,70));
let center = s.box.center;
let angle = 45.*Math.PI/180.;
let rotated_segment = s.rotate(angle, center)
```
### Intersection points

All classes have method ```intersect(otherShape)``` that return array of intersection points,
if two shapes intersect each other, or empty array otherwise. The is no predefined order
of intersection points in the array.

Please don't be confused, there are another two methods ```BooleanOperations.intersect()```
that performs boolean intersection of polygons and logical predicate ```Relations.intersect()```
that check if two shapes intersected or not. 

### Distance between shapes

All basic classes and polygon have method ```distanceTo(othershape)``` 
that calculate distance to other shape. Together with the distance function returns the shortest segment
between two shapes - segment between two closest point, where the first point lays
on ```this``` shape, and the second - on the other shape, see example:
```javascript
let s = segment(point(10,30), point(150, 40));
let c = circle(point(75,75),10);
let [dist,shortest_segment] = s.distanceTo(c);
```

### Intersection model (DE-9IM) 

The Dimensionally Extended nine-Intersection Model
 ([DE-9IM](https://en.wikipedia.org/wiki/DE-9IM)) is a topological model and a standard
 used to describe the spatial relations of two geometries in 2-dimensional plane.
 
 First, for every shape we define:
 * An interior
 * A boundary
 * An exterior
 
 For polygons, the interior, boundary and exterior are obvious, other types have some exclusions:
 * Point has no interior
 * Line has no boundary
 
 The DE-9IM model based on a 3×3 intersection matrix with the form:
 ```
          [ I(a) ^ I(b)   B(a) ^ I(b)   E(a) ^ I(b)
 de9im =    I(a) ^ B(b)   B(a) ^ B(b)   E(a) ^ B(b)
            I(a) ^ E(b)   B(a) ^ E(b)   E(a) ^ E(b)  ]
```

where ```a```and  ```b``` are two shapes (geometries), 

```I(), B(), E()``` denotes interior, boundary and exterior operator and

```^``` denotes operation of intersection. 
Dimension of intersection result depends on the dimension of shapes, for example,
* intersection between an interior of the line and an interior of the polygon is an
 array of segments
* intersection between an interior of the line and boundary polygon is 
an array of points (may include segments in case of touching)
* intersection between interiors of two polygons (if exists) will be
a polygon. 

DE-9IM matrix describes any possible relationships between two shapes on the plane.

DE-9IM matrix is available via method ```relate``` under namespace ```Relations```.

Each element of DE-9IM matrix is an array of the objects representing corresponding intersection.
Empty array represents case of no intersection.
If intersection is not applicable (i.e. intersection with a boundary for a line which has no boundary),
correspondent cell left undefined.

Intersection between two exteriors not calculated because usually it is meaningless.

```javascript
let {relate} = Relations;
// 
// define two shapes: polygon1, polygon2
//
let de9im = relate(polygon1, polygon2);
//
// explore 8 of 9 fields of the de9im matrix:
// de9im.I2I  de9im.B2I  de9im.E2I
// de9im.I2B  de9im.B2B  de9im.E2B
// de9im.I2E  de9im.B2E     N/A
```

Another common way to represent DE-9IM matrix is a string where 
* ```T``` represent intersection where array is not impty
* ```F``` represent intersection where array is empty
* ```.``` means not relevant or not applicable

String may be obtained with ```de9im.toString()``` method.

### Relationship predicates

The spatial relationships between two shapes exposed via namespace `Relations`.
The spatial predicates return `true` if relationship match and `false` otherwise.
```javascript
let {intersect, disjoint, equal, touch, inside, contain, covered, cover} = Relations;
// define shape a and shape b
let p = intersect(a, b);
console.log(p)             // true / false
```
* ```intersect``` - shapes a and b have at least one common point
* ```disjoint``` -  opposite to ```intersect```
* `equal` - shapes a and b are topologically equal
* `touch` - shapes a and b have at least one point in common but their interiors not intersect
* `inside` - shape a lies in the interior of shape b
* `contain` - shape b lies in the interior of shape b
* `covered` - every point of a lies or in the interior or on the boundary of shape b
* `covered` - every point of b lies or in the interior or on the boundary of shape a

### Boolean operations

Boolean operations on polygons available via namespace **BooleanOperations**.
Polygons in boolean operation should be valid: both operands should have same meaning of face orientation,
faces should not overlap each other and should not have self-intersections.

User is responsible to provide valid polygons, boolean operation methods do not check validity.

```javascript
let {unify, subtract, intersect, innerClip, outerClip} = BooleanOperations;
```
* `unify` - unify two polygons and return resulted polygon
* `subtract` - subtract second polygon from the first and return resulted polygon
* `intersect` - intersect two polygons and return resulted polygon
* `innerClip` - intersect two polygons and return boundary of intersection as 2 arrays.
 The first aray contains edges of the first polygon, the second - the edges of the second
* `outerClip` - clip boundary of the first polygon with the interior of the second polygon

Implementation based on Weiler-Atherton clipping algorithm,
described in the article [Hidden Surface Removal Using Polygon Area Sorting](https://www.cs.drexel.edu/~david/Classes/CS430/HWs/p214-weiler.pdf)

### Serialization

All **2d-geometry** shape objects may be serialized using `JSON.stringify()` method.
`JSON.stringify` transforms object to string using `.toJSON()` formatter implemented in the class. 
`JSON.parse` restore object from a string, and then constructor can use this object to create Flatten object.
 
```javascript
let l = line(point(4, 0), point(0, 4));
// Serialize
let str = JSON.stringify(l);  
// Parse and reconstruct
let l_json = JSON.parse(str);
let l_parsed = line(l_json);
```

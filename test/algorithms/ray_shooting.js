'use strict'

import { expect } from 'chai'
import Flatten from '../../index'
import { Inclusion } from '../../index'
import { Polygon, point, circle } from '../../index'
import { ray_shoot } from '../../dist/algorithms/ray_shooting'

describe('#Algorithms.Ray_Shooting', function () {
  it('Function defined', function () {
    expect(ray_shoot).to.exist
    expect(ray_shoot).to.be.a('function')
  })
  it('Can check point in contour. Rectangle Case 1 Inside', function () {
    let polygon = new Polygon()
    let points = [point(1, 1), point(3, 1), point(3, 3), point(1, 3)]
    let face = polygon.addFace(points)
    let contains = ray_shoot(polygon, point(2, 2))
    expect(contains).to.be.equal(Inclusion.INSIDE)
  })
  it('Can check point in contour. Rectangle Case 2 Quick reject - outside', function () {
    let polygon = new Polygon()
    let points = [point(1, 1), point(3, 1), point(3, 3), point(1, 3)]
    let face = polygon.addFace(points)
    let contains = ray_shoot(polygon, point(0, 2))
    expect(contains).to.be.equal(Inclusion.OUTSIDE)
  })
  it('Can check point in contour. Rectangle Case 3. Boundary overlapping', function () {
    let polygon = new Polygon()
    let points = [point(1, 1), point(3, 1), point(3, 3), point(1, 3)]
    let face = polygon.addFace(points)
    let contains = ray_shoot(polygon, point(2, 3))
    expect(contains).to.be.equal(Inclusion.BOUNDARY)
  })
  it('Can check point in contour. Circle Case 1 Boundary top', function () {
    let polygon = new Polygon()
    let a = circle(point(200, 200), 100).toArc(true)
    polygon.addFace([a])
    //polygon.addFace([b]);
    let pt = point(200, 100)
    let contains = ray_shoot(polygon, pt)
    expect(contains).to.be.equal(Inclusion.BOUNDARY)
  })
  it('Can check point in contour. Donut Case 1 Boundary top', function () {
    let polygon = new Polygon()
    let a = circle(point(200, 200), 100).toArc(true)
    let b = circle(point(200, 200), 75).toArc(false)
    polygon.addFace([a])
    polygon.addFace([b])
    let pt = point(200, 100)
    let contains = ray_shoot(polygon, pt)
    expect(contains).to.be.equal(Inclusion.BOUNDARY)
  })
  it('Can check point in contour. Donut Case 2 Center', function () {
    let polygon = new Polygon()
    let a = circle(point(200, 200), 100).toArc(true)
    let b = circle(point(200, 200), 75).toArc(false)
    polygon.addFace([a])
    polygon.addFace([b])
    let pt = point(200, 200)
    let contains = ray_shoot(polygon, pt)
    expect(contains).to.be.equal(Inclusion.OUTSIDE)
  })
  it('Can check point in contour. Donut Case 3 Inside', function () {
    let polygon = new Polygon()
    let a = circle(point(200, 200), 100).toArc(true)
    let b = circle(point(200, 200), 75).toArc(false)
    polygon.addFace([a])
    polygon.addFace([b])
    let pt = point(200, 290)
    let contains = ray_shoot(polygon, pt)
    expect(contains).to.be.equal(Inclusion.INSIDE)
  })
  it('Can check point in contour. Donut Case 4 Boundary inner circle start', function () {
    let polygon = new Polygon()
    let a = circle(point(200, 200), 100).toArc(true)
    let b = circle(point(200, 200), 75).toArc(false)
    polygon.addFace([a])
    polygon.addFace([b])
    let pt = point(125, 200)
    let contains = ray_shoot(polygon, pt)
    expect(contains).to.be.equal(Inclusion.BOUNDARY)
  })
  it('Can check point in contour. Donut Case 5 Another island inside', function () {
    let polygon = new Polygon()
    let a = circle(point(200, 200), 100).toArc(true)
    let b = circle(point(200, 200), 75).toArc(false)
    let c = circle(point(200, 200), 20).toArc(true)
    polygon.addFace([a])
    polygon.addFace([b])
    polygon.addFace([c])
    let pt = point(200, 200)
    let contains = ray_shoot(polygon, pt)
    expect(contains).to.be.equal(Inclusion.INSIDE)
  })
  it('Can check point in contour. Donut Case 6 Another island inside', function () {
    let polygon = new Polygon()
    let a = circle(point(200, 200), 100).toArc(true)
    let b = circle(point(200, 200), 75).toArc(false)
    let c = circle(point(200, 200), 20).toArc(true)
    polygon.addFace([a])
    polygon.addFace([b])
    polygon.addFace([c])
    let pt = point(150, 210)
    let contains = ray_shoot(polygon, pt)
    expect(contains).to.be.equal(Inclusion.OUTSIDE)
  })
})

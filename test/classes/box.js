import { expect } from 'chai'
import { Box, Point } from '../../index'

describe('Box', function () {
  it('can create new instance of Box', function () {
    let box = new Box()
    expect(box).to.be.an.instanceof(Box)
  })
  it('.center works', function () {
    expect(new Box(-2, -2, 2, 2).center).to.deep.equal(new Point(0, 0))
    expect(new Box(0, 10, 5, 15).center).to.deep.equal(new Point(2.5, 12.5))
  })
  it('.intersect() returns true if two boxes intersected', function () {
    let box1 = new Box(1, 1, 3, 3)
    let box2 = new Box(-3, -3, 2, 2)
    expect(box1.intersect(box2)).to.equal(true)
  })
  it('.contains() returns true if box contains point', function () {
    let box = new Box(1, 1, 3, 3)
    let a = new Point(2, 2)
    let b = new Point(2, 4)
    expect(box.contains(a)).to.equal(true)
    expect(box.contains(b)).to.equal(false)
  })
  it('.expand() expands current box with other', function () {
    let box1 = new Box(1, 1, 3, 3)
    let box2 = new Box(-3, -3, 2, 2)
    expect(box1.merge(box2)).to.deep.equal(new Box(-3, -3, 3, 3))
  })
})

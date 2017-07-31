/* global describe, context, it */

import expect from 'expect.js'
import Cite from './cite'
import {input, output} from './input.json'
input.wd.simple = require('./Q21972834.json')
input.wd.author = require('./Q27795847.json')

const testCaseGenerator = function (input, type, output, {
  exact = false,
  callback = v => v,
  link = false
} = {}) {
  return () => {
    const test = link ? Cite.parse.input.chainLink(input) : Cite.parse.input.chain(input)

    it('handles input type', () => {
      expect(Cite.parse.input.type(input)).to.be(type)
    })

    it('parses input correctly', () => {
      expect(callback(test)).to[exact ? 'be' : 'eql'](output)
    })
  }
}

const wikidataTestCaseOptions = {
  exact: true,
  callback: ([data]) => data.replace(/[&?]origin=\*/, ''),
  link: true
}
const doiLinkTestCaseOptions = {link: true}
const doiTestCaseOptions = {link: true, callback: ({title}) => title}

describe('input', () => {
  describe('Wikidata ID', testCaseGenerator(
    input.wd.id, 'string/wikidata', output.wd.api[0], wikidataTestCaseOptions))

  describe('Wikidata URL', testCaseGenerator(
    input.wd.url, 'url/wikidata', output.wd.api[0], wikidataTestCaseOptions))

  describe('Wikidata ID list', () => {
    describe('separated by spaces', testCaseGenerator(
      input.wd.list.space, 'list/wikidata', output.wd.api[1], wikidataTestCaseOptions))

    describe('separated by newlines', testCaseGenerator(
      input.wd.list.newline, 'list/wikidata', output.wd.api[1], wikidataTestCaseOptions))

    describe('separated by commas', testCaseGenerator(
      input.wd.list.comma, 'list/wikidata', output.wd.api[1], wikidataTestCaseOptions))
  })

  describe('Wikidata JSON', () => {
    testCaseGenerator(input.wd.simple, 'object/wikidata', output.wd.simple)()

    describe('with linked authors',
      testCaseGenerator(input.wd.author, 'object/wikidata', output.wd.author))
  })

  describe('DOI ID', testCaseGenerator(input.doi.id, 'string/doi', output.doi.api[0], doiLinkTestCaseOptions))
  describe('DOI URL', testCaseGenerator(input.doi.url, 'api/doi', output.doi.simple.title, doiTestCaseOptions))

  describe('DOI ID list', () => {
    describe('separated by spaces', testCaseGenerator(
      input.doi.list.space, 'list/doi', output.doi.api[1], doiLinkTestCaseOptions))

    describe('separated by newlines', testCaseGenerator(
      input.doi.list.newline, 'list/doi', output.doi.api[1], doiLinkTestCaseOptions))
  })

  describe('BibTeX string', () => {
    testCaseGenerator(input.bibtex.simple, 'string/bibtex', output.bibtex.simple)()

    describe('with whitespace and unknown fields',
      testCaseGenerator(input.bibtex.whitespace, 'string/bibtex', output.bibtex.whitespace))
  })

  describe('BibTeX JSON', testCaseGenerator(
    input.bibtex.json, 'object/bibtex', output.bibtex.simple))

  describe('Bib.TXT string', () => {
    testCaseGenerator(input.bibtxt.simple, 'string/bibtxt', [output.bibtxt])()

    describe('with multiple entries',
      testCaseGenerator(input.bibtxt.multiple, 'string/bibtxt', [output.bibtxt, output.bibtex.simple[0]]))

    describe('with whitespace',
      testCaseGenerator(input.bibtxt.whitespace, 'string/bibtxt', [output.bibtxt]))
  })

  describe('CSL-JSON', () => {
    testCaseGenerator(input.csl.simple, 'object/csl', [input.csl.simple])()

    context('as JSON string', testCaseGenerator(JSON.stringify(input.csl.simple), 'string/json', [input.csl.simple]))
    context('as JS Object string', testCaseGenerator(input.csl.string, 'string/json', [input.csl.simple]))
    context('with a syntax error', testCaseGenerator('{"hi"}', 'string/json', []))
  })

  describe('ContentMine JSON',
    testCaseGenerator(input.bibjson.simple, 'object/contentmine', output.bibjson.simple))

  describe('Array', () => {
    const objs = [{id: 'a'}, {id: 'b'}]

    testCaseGenerator(objs, 'array/csl', objs)()
    it('duplicates objects', () => {
      expect(Cite(objs).data).not.to.be(objs)
    })

    describe('nested', () => {
      const data = [[objs[0]], objs[1]]

      testCaseGenerator(data, 'array/else', objs)()
      it('duplicates objects', () => {
        const test = Cite(data).data

        expect(test[0]).not.to.be(objs[0])
        expect(test[1]).not.to.be(objs[1])
      })
    })
  })

  describe('Empty', () => {
    describe('string', () => {
      describe('empty', testCaseGenerator('', 'string/empty', []))
      describe('whitespace', testCaseGenerator('   \t\n \r  ', 'string/whitespace', []))
    })

    describe('null', testCaseGenerator(null, 'empty', []))
    describe('undefined', testCaseGenerator(undefined, 'empty', []))
  })
})

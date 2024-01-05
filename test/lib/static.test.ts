import { describe, test } from "mocha";
import { expect } from "chai";
import { QWikiCite } from "../../src/lib/static";
import { CitationTemplate } from "../../src/lib/ICitationTemplate";

describe("string escape", () => {
    test("replaces vertical bar", () => {
        expect(QWikiCite.esc('Test Page | Site')).to.equal("Test Page &#124; Site");
    })

    test("replaces curly brackets", () => {
        expect(QWikiCite.esc('Test Page {{ why }} Site')).to.equal("Test Page &#123;&#123; why &#125;&#125; Site");
    })

    test("removes weird unicode whitespace", () => {
        expect(QWikiCite.esc('f\u00a0f\u1680f\u2000f\u2001f\u2002f\u2003f\u2004f\u2005f\u2006f\u2007f\u2008f\u2009f\u200af\u2028f\u2029f\u202ff\u205ff\u3000f\ufeff')).to.equal("f f f f f f f f f f f f f f f f f f f ");
    })
})

describe("generate compact template", () => {
    const spec: {
        description: string;
        input: CitationTemplate;
        expected: string;
    }[] = [
        {
            description: 'works with empty input',
            input: {},
            expected: '{{citation}}',
        },
        {
            description: 'works with minimal fields',
            input: {
                title: 'Test Article',
                url: 'https://cloventt.net/test-article'
            },
            expected: '{{citation|title=Test Article|url=https://cloventt.net/test-article}}',
        },
        {
            description: 'works with empty fields',
            input: {
                title: 'Test Article',
                url: 'https://cloventt.net/test-article',
                author: undefined,
            },
            expected: '{{citation|title=Test Article|url=https://cloventt.net/test-article}}',
        },
    ];

    spec.forEach((s) => {
        test(s.description, () => {
            expect(QWikiCite.generateCitationString(s.input)).to.equal(s.expected);
        })
    })
})

describe("generate non-compact template", () => {
    const spec: {
        description: string;
        input: CitationTemplate;
        expected: string;
    }[] = [
        {
            description: 'works with empty input',
            input: {},
            expected: '{{citation\n}}',
        },
        {
            description: 'works with minimal fields',
            input: {
                title: 'Test Article',
                url: 'https://cloventt.net/test-article'
            },
            expected: '{{citation\n  |title=Test Article\n  |url=https://cloventt.net/test-article\n}}',
        },
        {
            description: 'works with empty fields',
            input: {
                title: 'Test Article',
                url: 'https://cloventt.net/test-article',
                author: undefined,
            },
            expected: '{{citation\n  |title=Test Article\n  |url=https://cloventt.net/test-article\n}}',
        },
    ];

    spec.forEach((s) => {
        test(s.description, () => {
            expect(QWikiCite.generateCitationString(s.input, false)).to.equal(s.expected);
        })
    })
})

describe("kebabize", () => {
    test("works", () => {
        expect(QWikiCite.kebabize("thisIsCamelCased")).to.equal("this-is-camel-cased");
    });

    test("passes through text that is not camel case", () => {
        expect(QWikiCite.kebabize("this_is_snake-and-kebab")).to.equal("this_is_snake-and-kebab");
    });
});

describe("camelize", () => {
    test("works", () => {
        expect(QWikiCite.camelize("this-is-kebab-cased")).to.equal("thisIsKebabCased");
    });

    test("passes through text that is not kebab case", () => {
        expect(QWikiCite.camelize("this_is_snake_andCamel")).to.equal("this_is_snake_andCamel");
    });
});

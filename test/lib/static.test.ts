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
            expected: '{{cite web}}',
        },
        {
            description: 'works with minimal fields',
            input: {
                title: 'Test Article',
                url: 'https://cloventt.net/test-article'
            },
            expected: '{{cite web|title=Test Article|url=https://cloventt.net/test-article}}',
        },
        {
            description: 'works with empty fields',
            input: {
                title: 'Test Article',
                url: 'https://cloventt.net/test-article',
                author: undefined,
            },
            expected: '{{cite web|title=Test Article|url=https://cloventt.net/test-article}}',
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
            expected: '{{cite web\n}}',
        },
        {
            description: 'works with minimal fields',
            input: {
                title: 'Test Article',
                url: 'https://cloventt.net/test-article'
            },
            expected: '{{cite web\n  |title=Test Article\n  |url=https://cloventt.net/test-article\n}}',
        },
        {
            description: 'works with empty fields',
            input: {
                title: 'Test Article',
                url: 'https://cloventt.net/test-article',
                author: undefined,
            },
            expected: '{{cite web\n  |title=Test Article\n  |url=https://cloventt.net/test-article\n}}',
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

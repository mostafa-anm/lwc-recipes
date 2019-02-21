import { createElement } from 'lwc';
import ContactList from 'c/contactList';
import { registerApexTestWireAdapter } from '@salesforce/lwc-jest';
import getContactList from '@salesforce/apex/ContactController.getContactList';

// Realistic data with a list of contacts
const mockGetContactList = require('./data/getContactList.json');
// An empty list of records to verify the component does something reasonable
// when there is no data to display
const mockGetContactListNoRecords = require('./data/getContactListNoRecords.json');

// Register as an Apex wire adapter. Some tests verify that provisioned values trigger desired behavior.
const getContactListAdapter = registerApexTestWireAdapter(getContactList);

describe('c-contact-list', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();
    });

    describe('getContactList @wire data', () => {
        it('with six records', () => {
            const USER_NAME_RESULT = 'Amy Taylor';
            const USER_PIC_RESULT =
                'https://s3-us-west-1.amazonaws.com/sfdc-demo/people/amy_taylor.jpg';
            const USER_COUNT_RESULT = 6;

            const element = createElement('c-contact-list', {
                is: ContactList
            });
            document.body.appendChild(element);
            getContactListAdapter.emit(mockGetContactList);
            return Promise.resolve().then(() => {
                const nameEls = element.shadowRoot.querySelectorAll('p');
                expect(nameEls.length).toBe(USER_COUNT_RESULT);
                expect(nameEls[0].textContent).toBe(USER_NAME_RESULT);

                const picEl = element.shadowRoot.querySelector('img');
                expect(picEl.src).toBe(USER_PIC_RESULT);
            });
        });

        it('with no record', () => {
            const element = createElement('c-contact-list', {
                is: ContactList
            });
            document.body.appendChild(element);
            getContactListAdapter.emit(mockGetContactListNoRecords);
            return Promise.resolve().then(() => {
                const nameEls = element.shadowRoot.querySelectorAll('p');
                expect(nameEls.length).toBe(0);
            });
        });
    });

    it('sends custom event "contactselect" with contactId on click', () => {
        const EVENT_DETAIL_PARAMETER = { contactId: '0031700000pJRRSAA4' };

        const element = createElement('c-contact-list', {
            is: ContactList
        });
        document.body.appendChild(element);

        const handler = jest.fn();
        element.addEventListener('contactselect', handler);

        getContactListAdapter.emit(mockGetContactList);
        return Promise.resolve()
            .then(() => {
                const linkEl = element.shadowRoot.querySelector('a');
                linkEl.click();
            })
            .then(() => {
                expect(handler).toHaveBeenCalled();
                expect(handler.mock.calls[0][0].detail).toEqual(
                    EVENT_DETAIL_PARAMETER
                );
            });
    });
});
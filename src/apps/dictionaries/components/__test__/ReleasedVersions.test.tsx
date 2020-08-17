import React from 'react';
import ReleasedVersions from '../../../../apps/dictionaries/components/ReleasedVersions';
import {render, fireEvent, getByText} from '../../../../test-utils';
import '@testing-library/jest-dom'
import {APIDictionaryVersion} from "../../types";

type releasedVersionProps = React.ComponentProps<typeof ReleasedVersions>;

const baseProps: releasedVersionProps = {
    versions: [],
    showCreateVersionButton: true,
    createDictionaryVersion: function createDictonaryVersion() {
    },
    createVersionLoading: true,
    createVersionError: {detail: "error"},
    dictionaryUrl: "Dictionary url",
    editDictionaryVersion: function editDictonaryVersion() {
    },
};

function renderUI(props: Partial<releasedVersionProps> = {}) {
    return render(
        <ReleasedVersions {...baseProps} {...props}/>
    );
}

const releasedVersion: APIDictionaryVersion = {
    id: "2",
    released: true,
    version_url: "version_url",
    url: "url",
    external_id: "3"
};
const unreleasedVersion: APIDictionaryVersion = {
    id: "2",
    released: false,
    version_url: "version_url",
    external_id: "3",
    url: "url"
};

describe("ReleasedVersions", () => {
    it('should match snapshot', () => {
        const {container} = renderUI({
            versions: [releasedVersion],
            showCreateVersionButton: true
        });

        expect(container).toMatchSnapshot();
    })
});

describe("Dictionary release version table", () => {
    it('checks if table headers are as expected', () => {
        const headerRow: Array<string> = [
            "ID",
            "Description",
            "Concepts",
            "Subscription URL",
            "Release Status"
        ];
        const {getByText} = renderUI({
            versions: [releasedVersion]
        });

        headerRow.forEach(function (header) {
            expect(getByText(header)).toBeInTheDocument();
        });
    });
});

describe("toggleButton for dictionary release status", () => {
    it('check if toggle button is present', () => {
        const {container} = renderUI({
            versions: [releasedVersion]
        });
        const toggleBtnElement = container.querySelector("[data-testid='2']");

        expect(toggleBtnElement).not.toBeNull();
    });

    it('check if toggle button is enabled for an released dictionary', () => {
        const {container} = renderUI({
            versions: [releasedVersion]
        });
        const toggleBtnElement: HTMLElement | null = container.querySelector("[data-testid='2']");

        expect(toggleBtnElement != null && toggleBtnElement.closest('span')).toHaveClass('Mui-checked');
    });

    it('check if toggle button is unchecked for an unreleased dictionary', () => {
        const {container} = renderUI({
            versions: [unreleasedVersion]
        });
        const toggleBtnElement: HTMLElement | null = container.querySelector("[data-testid='2']");

        expect(toggleBtnElement != null && toggleBtnElement.closest('span')).not.toHaveClass('Mui-checked');
    });

    it('check if onclick of dictionary toggle button opens confirmation dialog', () => {
        const {getByRole, getByTestId} = renderUI({
            versions: [unreleasedVersion],
            showCreateVersionButton: true
        });

        getByRole('checkbox').click();
        const dialog = getByTestId('confirm-dialog');
        expect(dialog).toBeTruthy();
    });

    it('check if confirmation dialog for releasing unreleased dictionary contains correct confirmation message', () => {
        const { getByRole, getByTestId} = renderUI({
            versions: [unreleasedVersion],
            showCreateVersionButton: true
        });

        getByRole('checkbox').click();
        const dialog = getByTestId('confirm-dialog');
        expect(getByText( dialog,"Are you sure to mark version")).toBeInTheDocument();
        expect(getByText( dialog,"released")).toBeInTheDocument();
        expect(getByText( dialog,"2")).toBeInTheDocument();
    });

    it('check if confirmation dialog for un releasing released dictionary contains correct confirmation message', () => {
        const { getByRole, getByTestId} = renderUI({
            versions: [releasedVersion],
            showCreateVersionButton: true
        });

        getByRole('checkbox').click();
        const dialog = getByTestId('confirm-dialog');
        expect(getByText( dialog,"Are you sure to mark version")).toBeInTheDocument();
        expect(getByText( dialog,"unreleased")).toBeInTheDocument();
        expect(getByText( dialog,"2")).toBeInTheDocument();
    });

    it('check if onclick of released dictionary dialog yes button makes the required function call', () => {
        const spyOnEditDictionaryVersion = jest.fn();
        const { getByRole, getByTestId} = renderUI({
            versions: [releasedVersion],
            showCreateVersionButton: true,
            editDictionaryVersion: spyOnEditDictionaryVersion
        });
        getByRole('checkbox').click();
        const dialog = getByTestId('confirm-dialog');
        getByText(dialog,"Yes").click();
        expect(spyOnEditDictionaryVersion).toBeCalledWith({"id": "2", "released": false});
    });

    it('check if onclick of unreleased dictionary dialog no button does not change the status to released', () => {
        const spyOnEditDictionaryVersion = jest.fn();
        const { getByRole, getByTestId} = renderUI({
            versions: [unreleasedVersion],
            showCreateVersionButton: true,
            editDictionaryVersion: spyOnEditDictionaryVersion
        });
        getByRole('checkbox').click();
        const dialog = getByTestId('confirm-dialog');
        getByText(dialog,"No").click();
        expect(getByTestId('2').closest('span')).not.toHaveClass('Mui-checked');
        expect(spyOnEditDictionaryVersion).not.toBeCalled();
    });

    describe('when user is not the owner of sources', () => {
        it('should not open confirmation dialog onclick of dictionary toggle button', () => {
            const {container, getByRole, getByTestId} = renderUI({
                versions: [unreleasedVersion],
                showCreateVersionButton: false
            });
            getByRole('checkbox').click();
            const dialog = container.querySelector('[data-testid="confirm-dialog"]');
            expect(dialog).toBeNull();
            expect(getByTestId('2').closest('span')).not.toHaveClass('Mui-checked');
        });

        it("should show tooltip with valid message on hovering the toggle button", async () => {
            const {getByTitle, getByTestId} = renderUI({
                versions: [unreleasedVersion],
                showCreateVersionButton: false
            });
            const toggleButton: HTMLElement | null = getByTestId('2').closest('span');
            expect(toggleButton).not.toBeNull();
            toggleButton !== null && fireEvent.mouseMove(toggleButton);
            expect(getByTitle("You don’t have permission to change the status")).toBeInTheDocument();
        });
    })


});

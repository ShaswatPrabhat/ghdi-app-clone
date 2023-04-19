import { mount } from "@vue/test-utils";
import { describe, beforeEach, it, expect, vi } from "vitest";
import UploadCSV from "../uploadCSV/upload-csv.vue";
import axios from "axios";
import Papa from "papaparse";
import flushPromises from "flush-promises";
import * as uploadUtils from "../uploadCSV/uploadUtils";
const event = {
  target: {
    files: [
      {
        name: "file.csv",
        size: 2,
        type: "text/csv",
      },
    ],
  },
};

describe("Upload CSV", () => {
  let wrapper;
  let countryStatuses = [
    {
      countryName: "IND",
      success: "false",
      currentStatus: "REVIEW_PENDING",
      message: "Country is already in REVIEW_PENDING state",
    },
    {
      countryName: "THA",
      success: "true",
      currentStatus: "REVIEW_PENDING",
      message: "",
    },
    {
      countryName: "PAK",
      success: "false",
      currentStatus: "PUBLISHED",
      message: "Country is already in PUBLISHED state",
    },
  ];

  const axiosPostSpy = vi.spyOn(axios, "post");
  const papaParseSpy = vi.spyOn(Papa, "parse").mockImplementation(() => null);
  const validateFieldsSpy = vi.spyOn(uploadUtils, "validateFields");

  beforeEach(() => {
    axiosPostSpy.mockReset();
    wrapper = mount(UploadCSV);
  });

  it("should submit data when the csv is uploaded", async () => {
    axiosPostSpy.mockResolvedValue({ data: countryStatuses });
    wrapper.vm.submitData();
    await flushPromises();

    expect(axiosPostSpy.mock.calls[0][0]).to.equal("/api/bff/countries/submit");
  });

  it("should render upload csv", async () => {
    expect(wrapper.vm.$el).toMatchSnapshot();
  });

  it("import to server button should be disabled at start", async () => {
    expect(wrapper.vm.validationStatus).toBe(null);
    const importButton = wrapper.find('[data-testid="import-button"]');
    expect(importButton.attributes().disabled).toEqual("disabled");
  });

  it("should call validateFields method when uploadFile is triggered", async () => {
    wrapper.vm.uploadFile(event);
    expect(papaParseSpy).toHaveBeenCalledWith(
      {
        name: "file.csv",
        size: 2,
        type: "text/csv",
      },
      expect.objectContaining({
        header: true,
        worker: true,
      })
    );
    papaParseSpy.mock.calls[0][1].complete({ data: ["abc"] });
    expect(validateFieldsSpy).toHaveBeenCalledOnce();
    expect(validateFieldsSpy).toHaveBeenCalledWith("abc");
  });
});
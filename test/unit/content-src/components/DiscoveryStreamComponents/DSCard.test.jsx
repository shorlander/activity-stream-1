import {
  DSCard,
  PlaceholderDSCard,
} from "content-src/components/DiscoveryStreamComponents/DSCard/DSCard";
import {
  DSContextFooter,
  StatusMessage,
} from "content-src/components/DiscoveryStreamComponents/DSContextFooter/DSContextFooter";
import { actionCreators as ac } from "common/Actions.jsm";
import { DSLinkMenu } from "content-src/components/DiscoveryStreamComponents/DSLinkMenu/DSLinkMenu";
import React from "react";
import { SafeAnchor } from "content-src/components/DiscoveryStreamComponents/SafeAnchor/SafeAnchor";
import { shallow } from "enzyme";

describe("<DSCard>", () => {
  let wrapper;
  let sandbox;

  beforeEach(() => {
    wrapper = shallow(<DSCard />);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should render", () => {
    assert.ok(wrapper.exists());
    assert.ok(wrapper.find(".ds-card"));
  });

  it("should render a SafeAnchor", () => {
    wrapper.setProps({ url: "https://foo.com" });

    assert.equal(
      wrapper
        .children()
        .at(0)
        .type(),
      SafeAnchor
    );
    assert.propertyVal(
      wrapper
        .children()
        .at(0)
        .props(),
      "url",
      "https://foo.com"
    );
  });

  it("should pass onLinkClick prop", () => {
    assert.propertyVal(
      wrapper
        .children()
        .at(0)
        .props(),
      "onLinkClick",
      wrapper.instance().onLinkClick
    );
  });

  it("should render DSLinkMenu", () => {
    assert.equal(
      wrapper
        .children()
        .at(1)
        .type(),
      DSLinkMenu
    );
  });

  it("should start with no .active class", () => {
    assert.equal(wrapper.find(".active").length, 0);
  });

  it("should render badges for pocket, bookmark when not a spoc element ", () => {
    wrapper = shallow(<DSCard context_type="bookmark" />);
    const contextFooter = wrapper.find(DSContextFooter).shallow();

    assert.lengthOf(contextFooter.find(StatusMessage), 1);
  });

  it("should render Sponsored Context for a spoc element", () => {
    const context = "Sponsored by Foo";
    wrapper = shallow(<DSCard context_type="bookmark" context={context} />);
    const contextFooter = wrapper.find(DSContextFooter).shallow();

    assert.lengthOf(contextFooter.find(StatusMessage), 0);
    assert.equal(contextFooter.find(".story-sponsored-label").text(), context);
  });

  describe("onLinkClick", () => {
    let dispatch;

    beforeEach(() => {
      dispatch = sandbox.stub();
      wrapper = shallow(<DSCard dispatch={dispatch} />);
    });

    it("should call dispatch with the correct events", () => {
      wrapper.setProps({ id: "fooidx", pos: 1, type: "foo" });

      wrapper.instance().onLinkClick();

      assert.calledTwice(dispatch);
      assert.calledWith(
        dispatch,
        ac.UserEvent({
          event: "CLICK",
          source: "FOO",
          action_position: 1,
        })
      );
      assert.calledWith(
        dispatch,
        ac.ImpressionStats({
          click: 0,
          source: "FOO",
          tiles: [{ id: "fooidx", pos: 1 }],
        })
      );
    });

    it("should call dispatch with a shim", () => {
      wrapper.setProps({
        id: "fooidx",
        pos: 1,
        type: "foo",
        shim: {
          click: "click shim",
        },
      });

      wrapper.instance().onLinkClick();

      assert.calledTwice(dispatch);
      assert.calledWith(
        dispatch,
        ac.UserEvent({
          event: "CLICK",
          source: "FOO",
          action_position: 1,
        })
      );
      assert.calledWith(
        dispatch,
        ac.ImpressionStats({
          click: 0,
          source: "FOO",
          tiles: [{ id: "fooidx", pos: 1, shim: "click shim" }],
        })
      );
    });
  });
});

describe("<PlaceholderDSCard> component", () => {
  it("should have placeholder prop", () => {
    const wrapper = shallow(<PlaceholderDSCard />);
    const card = wrapper.find(DSCard);
    assert.lengthOf(card, 1);

    const placeholder = wrapper.find(DSCard).prop("placeholder");
    assert.isTrue(placeholder);
  });

  it("should contain placeholder div", () => {
    const wrapper = shallow(<DSCard placeholder={true} />);
    const card = wrapper.find("div.ds-card.placeholder");
    assert.lengthOf(card, 1);
  });

  it("should not be clickable", () => {
    const wrapper = shallow(<DSCard placeholder={true} />);
    const anchor = wrapper.find("SafeAnchor.ds-card-link");
    assert.lengthOf(anchor, 1);

    const linkClick = anchor.prop("onLinkClick");
    assert.isUndefined(linkClick);
  });

  it("should not have context menu", () => {
    const wrapper = shallow(<DSCard placeholder={true} />);
    const linkMenu = wrapper.find(DSLinkMenu);
    assert.lengthOf(linkMenu, 0);
  });
});

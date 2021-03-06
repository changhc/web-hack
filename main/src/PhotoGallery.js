import React, { Component } from 'react';
import { Item } from './Item';
import LightBox from './LightBox';

// const hostname = 'http://localhost:5000';
const hostname = '';

class PhotoGallery extends Component {
  constructor() {
    super();
    this.state = {
      width: 200,
      maxHeight: 0,
      margin: 2,
      ncol: 3,
      imageMeta: [],
      nowOpenIndex: -1,
    };
    this.fetchImageMeta = this.fetchImageMeta.bind(this);
    this.showLightBox = this.showLightBox.bind(this);
    this.closeLightBox = this.closeLightBox.bind(this);
    this.changeImage = this.changeImage.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  componentDidMount() {
    this.fetchImageMeta();
  }

  fetchImageMeta() {
    window.fetch(`${hostname}/api/images`, {
      method: 'GET',
      mode: 'cors',
      headers: { Accept: 'application/json' },
    }).then(res => res.json(),
    ).then((json) => {
      const body = json;
      const colY = Array(this.state.ncol).fill(0);
      let max = this.state.maxHeight;
      this.setState({ width: json.width });
      for (let i = 0; i < json.meta.length; i += 1) {
        const topVal = Math.min.apply(null, colY);
        const minCol = colY.indexOf(topVal);
        colY[minCol] += (json.meta[i].height + this.state.margin);
        if (max < topVal + json.meta[i].height) {
          max = topVal + json.meta[i].height;
        }
        body.meta[i] = {
          hidden: true,
          width: this.state.width,
          height: json.meta[i].height,
          thumb: hostname + json.meta[i].thumb,
          origin: hostname + json.meta[i].origin,
          left: (this.state.width + this.state.margin) * minCol,
          top: topVal,
          index: i,
        };
      }
      this.setState({ imageMeta: body.meta, maxHeight: max });
      for (let i = 0; i < this.state.imageMeta.length; i += 1) {
        setTimeout(() => {
          const meta = this.state.imageMeta;
          meta[i].hidden = false;
          this.setState({ imageMeta: meta });
        }, Math.random() * 1000);
      }
    }).catch((err) => {
      console.error(err);
    });
  }

  showLightBox(index) {
    this.setState({ nowOpenIndex: index });
  }

  closeLightBox() {
    this.setState({ nowOpenIndex: -1 });
  }

  changeImage(next) {
    this.setState({
      nowOpenIndex: next ? this.state.nowOpenIndex + 1 : this.state.nowOpenIndex - 1,
    });
  }

  renderItem(item) {
    return (
      item.hidden ? null : <Item key={item.origin} meta={item} click={this.showLightBox} />
    );
  }

  render() {
    const rootStyle = {
      margin: 10,
      position: 'relative',
      height: this.state.maxHeight,
    };
    const lightBox = this.state.nowOpenIndex === -1
      ? null
      : (
        <LightBox
          meta={this.state.imageMeta[this.state.nowOpenIndex]}
          change={this.changeImage}
          close={this.closeLightBox}
          tail={this.state.nowOpenIndex === this.state.imageMeta.length - 1}
          head={this.state.nowOpenIndex === 0}
        />
      );

    return (
      <div style={rootStyle}>
        {this.state.imageMeta.map(this.renderItem)}
        {lightBox}
      </div>
    );
  }
}

export default PhotoGallery;

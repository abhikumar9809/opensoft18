import React, { Component } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
// import Samples from './components/samples';
import Lexigram from './components/lexigram';
import './styles/App.css';
import './styles/buttons.css';
import './styles/dropzone.css';
import './styles/flexboxgrid/flexboxgrid.min.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      preview: null,
      outputObjects: [],
      image_name: '',
      canDownload: false,
      lexigramData: null,
      isFresh: false,
    };

    this.onDrop = this.onDrop.bind(this);
    this.resetImage = this.resetImage.bind(this);
    this.doDownload = this.doDownload.bind(this);
    this.flipFresh = this.flipFresh.bind(this);
  }

  onDrop(acceptedFiles) {
    const uploaders = acceptedFiles.map((uploadedFile) => {
      this.setState({
        preview: uploadedFile.preview,
      });
      const formData = new FormData();
      formData.append('image', uploadedFile);
      return axios({
        method: 'post',
        url: 'http://localhost:8080/upload',
        data: formData,
        headers: { 'content-type': 'multipart/form-data' },
      }).then((response) => {
        console.log(response);
        const { data } = response;
        console.log(data);
        this.setState({
          outputObjects: [...this.state.outputObjects, data.image],
          image_name: data.image_name,
        });
        return axios({
          method: 'get',
          url: `http://localhost:8080/continue/${data.image_name}`,
        });
      }).then((response) => {
        const { data } = response;
        console.log(data);
        this.setState({
          outputObjects: [...this.state.outputObjects, data.replaced_image, data.fresh_image],
          lexigramData: data.lexigram_data,
          isFresh: false,
        });
        return axios({
          method: 'get',
          url: `http://localhost:8080/finish/${data.image_name}`,
        });
      }).then((response) => {
        const { data } = response;
        console.log(data);
        this.setState({
          canDownload: true,
        });
      });
    });

    axios.all(uploaders).then(() => {
      console.log('Image uploaded');
    });
  }

  doDownload(index) {
    return axios({
      method: 'get',
      url: `http://localhost:8080/download/${this.state.image_name}/${index}`,
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      if (index === 0 || index === 2) {
        link.setAttribute('download', `${this.state.image_name}`);
      } else {
        let filename = this.state.image_name;
        filename = filename.substring(0, filename.lastIndexOf('.'));
        link.setAttribute('download', `${filename}.pdf`);
      }
      document.body.appendChild(link);
      link.click();
    });
  }

  resetImage() {
    this.setState({
      preview: null,
      outputObjects: [],
      image_name: '',
      canDownload: false,
      lexigramData: null,
      isFresh: false,
    });
  }

  flipFresh() {
    this.setState({
      isFresh: !this.state.isFresh,
    });
  }

  render() {
    const { lexigramData } = this.state;
    return (
      <div className="App">
        <div className="App-welcome">
          <div className="welcome-text">
            DigiCon
            <div className="App-description">
              { 'It is hard to change a doctor\'s handwriting. But it shouldn\'t be hard to read them.' }
            </div>
          </div>
          <div className="welcome-bottom" />
        </div>
        <header className="App-main">
          <div className="main-content">
            <div className="row middle-xs app-title-text">
              <div className="App-title col-xs-6">
                DigiCon
              </div>
              {
                this.state.preview &&
                <div
                  className="new-image col-xs-6"
                  onClick={() => this.resetImage()}
                  onKeyPress={() => this.resetImage()}
                  role="button"
                  tabIndex={0}
                >
                  New image
                </div>
              }
            </div>
            {/* <Samples /> */}
            {
              !this.state.preview &&
              <Dropzone
                onDrop={this.onDrop}
                accept="image/*"
                multiple={false}
                className="image-dropzone"
              >
                <p>
                  Try dropping a prescription here, or click to select a prescription to upload.
                </p>
              </Dropzone>
            }
            {
              this.state.preview &&
              <div className="row previews">
                <div className="original-preview col-xs-4">
                  <img src={this.state.preview} alt="Uploaded preview" />
                </div>
                {
                  this.state.outputObjects[0] != null ? (
                    <div className="bboxes-preview col-xs-4">
                      <img src={`data:image/jpeg;base64,${this.state.outputObjects[0]}`} alt="Bounding boxes preview" />
                    </div>
                  ) : (
                    <div className="bboxes-preview col-xs-4">
                      <img src={this.state.preview} alt="Bounding boxes preview" />
                    </div>
                  )
                }
                {
                  this.state.outputObjects[1] != null ? (
                    <div
                      className="bboxes-preview col-xs-4 final-preview"
                      onClick={() => this.flipFresh()}
                      onKeyPress={() => this.flipFresh()}
                      role="button"
                      tabIndex={0}
                    >
                      {
                        this.state.isFresh ? (
                          <img src={`data:image/jpeg;base64,${this.state.outputObjects[1]}`} alt="Bounding boxes preview" />
                        ) : (
                          <img src={`data:image/jpeg;base64,${this.state.outputObjects[2]}`} alt="Bounding boxes preview" />
                        )
                      }
                    </div>
                  ) : (
                    <div className="bboxes-preview col-xs-4">
                      <img src={this.state.preview} alt="Bounding boxes preview" />
                    </div>
                  )
                }
              </div>
            }
            {
              this.state.canDownload &&
              <div className="row download-buttons">
                <div className="col-md-3 col-xs-6">
                  <div
                    className="download-button"
                    onClick={() => this.doDownload(0)}
                    onKeyPress={() => this.doDownload(0)}
                    role="button"
                    tabIndex={0}
                  >
                    Download overlaid image
                  </div>
                </div>
                <div className="col-md-3 col-xs-6">
                  <div
                    className="download-button"
                    onClick={() => this.doDownload(1)}
                    onKeyPress={() => this.doDownload(1)}
                    role="button"
                    tabIndex={0}
                  >
                    Download overlaid PDF
                  </div>
                </div>
                <div className="col-md-3 col-xs-6">
                  <div
                    className="download-button"
                    onClick={() => this.doDownload(2)}
                    onKeyPress={() => this.doDownload(2)}
                    role="button"
                    tabIndex={0}
                  >
                    Download clean image
                  </div>
                </div>
                <div className="col-md-3 col-xs-6">
                  <div
                    className="download-button"
                    onClick={() => this.doDownload(3)}
                    onKeyPress={() => this.doDownload(3)}
                    role="button"
                    tabIndex={0}
                  >
                    Download clean PDF
                  </div>
                </div>
              </div>
            }
            <div className="row">
              <div className="col-xs-6 lexigram-table">
                {
                  lexigramData &&
                  <div>
                    <div className="lexigram-title">
                      Medical knowledge
                    </div>
                    <Lexigram
                      lexigramData={lexigramData}
                    />
                  </div>
                }
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }
}

export default App;

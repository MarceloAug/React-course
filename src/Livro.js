import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

export default class LivroBox extends Component {


    constructor() {
        super();
        this.state = {lista : [],autores:[]};
      }

    componentDidMount(){
        $.ajax({
             url:"https://cdc-react.herokuapp.com/api/livros",
             dataType: 'json',
             success:  function(resposta){
                this.setState({lista:resposta});
             }.bind(this)
       });

       $.ajax({
        url:"https://cdc-react.herokuapp.com/api/autores",
        dataType: 'json',
        success:  function(resposta){
           this.setState({autores:resposta});
            }.bind(this)
        });
       PubSub.subscribe('atualiza-lista-autores', function(topico,novaListagem){
           this.setState({lista:novaListagem});
       }.bind(this));
   }



    render(){
      return (
        <div>
          <div className="header">
            <h1>Cadastro de livros</h1>
          </div>
          <div className="content" id="content">
            <FormularioLivro autores={this.state.autores}/>
            <TabelaLivros lista={this.state.lista}/>
          </div>
        </div>
      );
    }   
  }


class TabelaLivros extends Component{
  	render() {
      return(
          <div>            
              <table className="pure-table">
                <thead>
                  <tr>
                    <th>Titulo</th>
                    <th>Preco</th>
                    <th>Autor</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.props.lista.map(function(livro){
                      return (
                        <tr key={livro.id}>
                            <td>{livro.titulo}</td>
                            <td>{livro.preco}</td>
                            <td>{livro.autor.nome}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
          </div>
  );}
}


class FormularioLivro extends Component{

    constructor() {
      super();
      this.state = {titulo:'',preco:'',autorID:''};
      this.enviaForm = this.enviaForm.bind(this);
      this.setTitulo = this.setTitulo.bind(this);
      this.setPreco = this.setPreco.bind(this);
      this.setAutorId = this.setAutorId.bind(this);
    }
    
    setTitulo(evento){
        this.setState({Titulo:evento.target.value});
      }
      
    setPreco(evento){
        this.setState({preco:evento.target.value});
      }
      
    setAutorId(evento){
        this.setState({autorId:evento.target.value});
      }
    
    
      enviaForm(evento){
        evento.preventDefault();
        $.ajax({
          url:'http://localhost:8080/api/livros',
          contentType:'application/json',
          dataType:'json',
          type:'post',
          data: JSON.stringify({titulo:this.state.titulo,preco:this.state.preco,autorId:this.state.autorId}),
          success: function(novaListagem){
            PubSub.publish('atualiza-lista-livros',novaListagem);
            this.setState({titulo:'',preco:'',autorId:''});
          }.bind(this),
          error: function(resposta){
            if(resposta.status === 400) {
              new TratadorErros().publicaErros(resposta.responseJSON);
            }
      },
        beforeSende:function(){
            PubSub.publish("limpa-erros",{});
        }
        });
    
    }
    
      render() {
        return (
          <div className="pure-form pure-form-aligner">
            <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Título"/>                                              
                <InputCustomizado id="Preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preço"/>                                              
                <div className="pure-control-group">
                    <label htmlFor={this.props.id}>{this.props.label}</label>
                        <select value={this.state.autorId} name="autorId" onChange={this.setAutorId}>
                            <option value="">Selecione autor</option>
                            {
                                this.props.autores.map(function(autor){
                                    return <option value={autor.id}>{autor.nome}</option>
                                })
                            }
                        </select>
                </div>                                                
              <div className="pure-control-group">                                  
                  <label></label>
                  <button type="submit" className="pure-button pure-button-primary">Gravar</button>                                
              </div>
            </form>
          </div>
        );
      }
}

package controllers

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.stream.Materializer
import de.htwg.se.orderandchaos.OrderAndChaos
import de.htwg.se.orderandchaos.control.{CellSet, Control, Win}
import de.htwg.se.orderandchaos.control.json.JsonConverter
import javax.inject._
import parser.JsonExecutor
import play.api.libs.json.{JsValue, Json}
import play.api.libs.streams.ActorFlow
import play.api.mvc._

import scala.swing.Reactor
import scala.util.{Failure, Success, Try}


@Singleton
class GameController @Inject()(cc: ControllerComponents)(implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc) {
  val control: Control = OrderAndChaos.control
  val jsonExecutor = new JsonExecutor(control)

  def offline() = Action {
    implicit request: Request[AnyContent] =>
      Ok(views.html.offline())
  }

  def set(x: String, y: String, value: String): Action[AnyContent] = Action {
    val error = getError(() => control.play(x.toInt, y.toInt, value))
    Ok(views.html.orderandchaos(control.controller, error))
  }

  def undo(): Action[AnyContent] = Action {
    val error = getError(() => control.undo())
    Ok(views.html.orderandchaos(control.controller, error))
  }

  def redo(): Action[AnyContent] = Action {
    val error = getError(() => control.redo())
    Ok(views.html.orderandchaos(control.controller, error))
  }

  def reset(): Action[AnyContent] = Action {
    val error = getError(() => control.reset())
    Ok(views.html.orderandchaos(control.controller, error))
  }

  def display: Action[AnyContent] = Action {
    Ok(views.html.orderandchaos(control.controller, ""))
  }

  def about: Action[AnyContent] = Action {
    Ok(views.html.index())
  }

  def socket = WebSocket.accept[String, String](_ =>  {
    ActorFlow.actorRef(out => {
      println("Websocket connected!")
      OacWebsocketActor.create(out)
    })
  })

  object OacWebsocketActor {
    def create(out: ActorRef): Props = {
      Props(new OacWebsocketActor(out))
    }
  }

  class OacWebsocketActor(out: ActorRef) extends Actor with Reactor {
    listenTo(control)
    sendJson()

    def receive: PartialFunction[Any, Unit] = {
      case msg: String => jsonExecutor.execute(Json.parse(msg))
    }

    reactions += {
      case _: Win => sendJson()
      case _: CellSet => sendJson()
    }

    def sendJson(): Unit = {
      out ! Json.stringify(JsonConverter.convertToJson(control.controller))
    }
  }

  private def getError(f: () => Unit): String = Try(f()) match {
    case Success(_) => ""
    case Failure(e) => e.getMessage
  }
}

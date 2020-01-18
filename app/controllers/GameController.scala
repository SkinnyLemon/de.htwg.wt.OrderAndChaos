package controllers

import akka.actor.{ Actor, ActorRef, ActorSystem, Props }
import akka.stream.Materializer
import com.mohiva.play.silhouette.api.Silhouette
import com.mohiva.play.silhouette.api.actions.SecuredRequest
import de.htwg.se.orderandchaos.OrderAndChaos
import de.htwg.se.orderandchaos.control.{ CellSet, Control, Win }
import de.htwg.se.orderandchaos.control.json.JsonConverter
import javax.inject._
import org.webjars.play.WebJarsUtil
import parser.JsonExecutor
import play.api.i18n.I18nSupport
import play.api.libs.json.{ JsValue, Json }
import play.api.libs.streams.ActorFlow
import play.api.mvc._
import utils.auth.DefaultEnv

import scala.concurrent.Future
import scala.swing.Reactor
import scala.util.{ Failure, Success, Try }

@Singleton
class GameController @Inject() (
  cc: ControllerComponents,
  silhouette: Silhouette[DefaultEnv]
)(implicit
  webJarsUtil: WebJarsUtil,
  assets: AssetsFinder,
  system: ActorSystem,
  mat: Materializer) extends AbstractController(cc) with I18nSupport {
  val control: Control = OrderAndChaos.control
  val jsonExecutor = new JsonExecutor(control)

  def set(x: String, y: String, value: String): Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    val error = getError(() => control.play(x.toInt, y.toInt, value))
    Future.successful(Ok(views.html.orderandchaos(control.controller, error, request.identity)))
  }

  def undo(): Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    val error = getError(() => control.undo())
    Future.successful(Ok(views.html.orderandchaos(control.controller, error,request.identity)))
  }

  def redo(): Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    val error = getError(() => control.redo())
    Future.successful(Ok(views.html.orderandchaos(control.controller, error,request.identity)))
  }

  def reset(): Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    val error = getError(() => control.reset())
    Future.successful(Ok(views.html.orderandchaos(control.controller, error, request.identity)))
  }

  def display: Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    Future.successful(Ok(views.html.orderandchaos(control.controller, "", request.identity)))
  }
  //
  //  def about: Action[AnyContent] = Action {
  //    Ok(views.html.home())
  //  }

  def socket = WebSocket.accept[String, String](_ => {
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

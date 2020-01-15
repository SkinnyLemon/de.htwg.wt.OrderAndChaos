package parser

import de.htwg.se.orderandchaos.control.Control
import play.api.libs.json.{JsError, JsLookupResult, JsSuccess, JsValue, Json}

import scala.util.Try

class JsonExecutor(control: Control) {
  def execute(json: JsValue): Unit = (json \ "action").get.validate[String] match {
      case JsSuccess("set", _) => executeSet(json)
      case JsSuccess("undo", _) => Try(control.undo())
      case JsSuccess("redo", _) => Try(control.redo())
      case e: JsError => throw new IllegalArgumentException(stringifyError(e))
    }

  def executeSet(json: JsValue): Unit = {
    val x = validateInt(json \ "x")
    val y = validateInt(json \ "y")
    val cellType = validateString(json \ "type")
    control.play(x + 1, y + 1, cellType)
  }

  def validateInt(res: JsLookupResult): Int = res.get.validate[String] match {
    case JsSuccess(i, _) => i.toInt
    case e: JsError => throw new IllegalArgumentException(stringifyError(e))
  }

  def validateString(res: JsLookupResult): String = res.get.validate[String] match {
    case JsSuccess(s, _) => s
    case e: JsError => throw new IllegalArgumentException(stringifyError(e))
  }

  def stringifyError(e: JsError): String = Json.prettyPrint(JsError.toJson(e))
}
